import express from 'express';
import { z } from 'zod';
import { query, queryOne, transaction } from '../db/pool.js';
import { authRequired } from '../middleware/auth.js';
import { asyncHandler, HttpError } from '../middleware/errors.js';

const router = express.Router();

const itemSchema = z.object({
  servico_id: z.number().int().positive().optional().nullable(),
  descricao: z.string().min(1).max(255),
  quantidade: z.number().positive().default(1),
  valor_unitario: z.number().nonnegative(),
});

const notaSchema = z.object({
  cliente_id: z.number().int().positive(),
  veiculo_id: z.number().int().positive().optional().nullable(),
  mecanico_id: z.number().int().positive().optional().nullable(),
  forma_pagamento: z.enum(['dinheiro', 'pix', 'debito', 'credito', 'boleto']),
  desconto: z.number().nonnegative().default(0),
  status: z.enum(['paga', 'aberta', 'cancelada']).default('aberta'),
  observacoes: z.string().optional().nullable(),
  itens: z.array(itemSchema).min(1, 'Nota precisa de pelo menos 1 item'),
});

router.use(authRequired);

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const limit = Math.min(Number(req.query.limit) || 50, 200);
    const offset = Math.max(Number(req.query.offset) || 0, 0);
    const status = req.query.status;
    const q = (req.query.q || '').trim();
    const dataInicio = req.query.data_inicio;
    const dataFim = req.query.data_fim;

    const where = [];
    const params = [];

    if (status && ['paga', 'aberta', 'cancelada'].includes(status)) {
      where.push('n.status = ?');
      params.push(status);
    }
    if (q) {
      where.push('(c.nome LIKE ? OR n.numero LIKE ?)');
      params.push(`%${q}%`, `%${q}%`);
    }
    if (dataInicio) {
      where.push('n.data_emissao >= ?');
      params.push(dataInicio);
    }
    if (dataFim) {
      where.push('n.data_emissao <= ?');
      params.push(dataFim);
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const rows = await query(
      `SELECT n.*, c.nome AS cliente_nome, v.placa AS veiculo_placa, v.modelo AS veiculo_modelo,
              m.nome AS mecanico_nome
       FROM notas n
       INNER JOIN clientes c ON c.id = n.cliente_id
       LEFT JOIN veiculos v ON v.id = n.veiculo_id
       LEFT JOIN mecanicos m ON m.id = n.mecanico_id
       ${whereSql}
       ORDER BY n.data_emissao DESC, n.id DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const totalRow = await queryOne(
      `SELECT COUNT(*) AS total FROM notas n
       INNER JOIN clientes c ON c.id = n.cliente_id
       ${whereSql}`,
      params
    );

    res.json({ rows, total: totalRow?.total || 0 });
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const nota = await queryOne(
      `SELECT n.*,
        c.nome AS cliente_nome, c.cpf_cnpj AS cliente_cpf, c.telefone AS cliente_telefone,
        c.endereco AS cliente_endereco, c.cidade AS cliente_cidade, c.email AS cliente_email,
        v.placa AS veiculo_placa, v.modelo AS veiculo_modelo, v.ano AS veiculo_ano, v.cor AS veiculo_cor,
        m.nome AS mecanico_nome,
        u.nome AS usuario_nome
       FROM notas n
       INNER JOIN clientes c ON c.id = n.cliente_id
       LEFT JOIN veiculos v ON v.id = n.veiculo_id
       LEFT JOIN mecanicos m ON m.id = n.mecanico_id
       INNER JOIN users u ON u.id = n.usuario_id
       WHERE n.id = ?`,
      [req.params.id]
    );
    if (!nota) throw new HttpError(404, 'Nota não encontrada');
    nota.itens = await query(
      'SELECT * FROM nota_itens WHERE nota_id = ? ORDER BY ordem, id',
      [req.params.id]
    );
    res.json(nota);
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const data = notaSchema.parse(req.body);

    const nota = await transaction(async (conn) => {
      // Reserva próximo número
      await conn.execute(
        `UPDATE configuracoes SET valor = CAST(valor AS INTEGER) + 1
         WHERE chave = 'ultimo_numero_nota'`
      );
      const [[cfg]] = await conn.execute(
        `SELECT valor FROM configuracoes WHERE chave = 'ultimo_numero_nota'`
      );
      const numero = Number(cfg.valor);

      // Valida cliente/veiculo
      const [[cliente]] = await conn.execute(
        'SELECT id FROM clientes WHERE id = ?',
        [data.cliente_id]
      );
      if (!cliente) throw new HttpError(400, 'Cliente inválido');

      if (data.veiculo_id) {
        const [[v]] = await conn.execute(
          'SELECT id FROM veiculos WHERE id = ? AND cliente_id = ?',
          [data.veiculo_id, data.cliente_id]
        );
        if (!v) throw new HttpError(400, 'Veículo não pertence ao cliente informado');
      }

      // Totais
      const subtotal = data.itens.reduce(
        (sum, it) => sum + Number(it.quantidade) * Number(it.valor_unitario),
        0
      );
      const total = Math.max(0, subtotal - Number(data.desconto || 0));

      const [result] = await conn.execute(
        `INSERT INTO notas
          (numero, cliente_id, veiculo_id, mecanico_id, usuario_id,
           subtotal, desconto, total, forma_pagamento, status, observacoes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          numero,
          data.cliente_id,
          data.veiculo_id || null,
          data.mecanico_id || null,
          req.user.sub,
          subtotal.toFixed(2),
          Number(data.desconto || 0).toFixed(2),
          total.toFixed(2),
          data.forma_pagamento,
          data.status,
          data.observacoes || null,
        ]
      );

      const notaId = result.insertId;

      let ordem = 0;
      for (const it of data.itens) {
        const valorTotal = Number(it.quantidade) * Number(it.valor_unitario);
        await conn.execute(
          `INSERT INTO nota_itens
            (nota_id, servico_id, descricao, quantidade, valor_unitario, valor_total, ordem)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            notaId,
            it.servico_id || null,
            it.descricao,
            Number(it.quantidade).toFixed(2),
            Number(it.valor_unitario).toFixed(2),
            valorTotal.toFixed(2),
            ordem++,
          ]
        );
      }

      return { id: notaId, numero };
    });

    const full = await queryOne(
      `SELECT n.*, c.nome AS cliente_nome FROM notas n
       INNER JOIN clientes c ON c.id = n.cliente_id WHERE n.id = ?`,
      [nota.id]
    );
    full.itens = await query(
      'SELECT * FROM nota_itens WHERE nota_id = ? ORDER BY ordem, id',
      [nota.id]
    );
    res.status(201).json(full);
  })
);

router.patch(
  '/:id/status',
  asyncHandler(async (req, res) => {
    const schema = z.object({
      status: z.enum(['paga', 'aberta', 'cancelada']),
    });
    const { status } = schema.parse(req.body);
    await query('UPDATE notas SET status = ? WHERE id = ?', [status, req.params.id]);
    const nota = await queryOne('SELECT * FROM notas WHERE id = ?', [req.params.id]);
    if (!nota) throw new HttpError(404, 'Nota não encontrada');
    res.json(nota);
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    // Cancelamento lógico — preserva histórico/numeração
    await query('UPDATE notas SET status = ? WHERE id = ?', ['cancelada', req.params.id]);
    res.json({ ok: true });
  })
);

export default router;
