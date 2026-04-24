import express from 'express';
import { z } from 'zod';
import { query, queryOne, transaction } from '../db/pool.js';
import { authRequired } from '../middleware/auth.js';
import { asyncHandler, HttpError } from '../middleware/errors.js';

const router = express.Router();

const clienteSchema = z.object({
  nome: z.string().min(2).max(160),
  cpf_cnpj: z.string().max(20).optional().nullable(),
  telefone: z.string().min(8).max(20),
  email: z.string().email().max(160).optional().nullable().or(z.literal('')),
  endereco: z.string().max(255).optional().nullable(),
  cidade: z.string().max(100).optional().nullable(),
  observacoes: z.string().optional().nullable(),
});

const veiculoSchema = z.object({
  placa: z.string().min(4).max(10),
  modelo: z.string().min(1).max(120),
  ano: z.number().int().min(1950).max(2100).optional().nullable(),
  cor: z.string().max(40).optional().nullable(),
  observacoes: z.string().optional().nullable(),
});

router.use(authRequired);

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const q = (req.query.q || '').trim();
    const limit = Math.min(Number(req.query.limit) || 50, 200);
    const offset = Math.max(Number(req.query.offset) || 0, 0);

    let sql = `
      SELECT c.*,
        (SELECT COUNT(*) FROM veiculos v WHERE v.cliente_id = c.id) AS veiculos_count,
        (SELECT COUNT(*) FROM notas n WHERE n.cliente_id = c.id) AS notas_count
      FROM clientes c`;
    const params = [];

    if (q) {
      sql += ` WHERE c.nome LIKE ? OR c.telefone LIKE ? OR c.cpf_cnpj LIKE ?
        OR EXISTS (SELECT 1 FROM veiculos v WHERE v.cliente_id = c.id AND v.placa LIKE ?)`;
      const like = `%${q}%`;
      params.push(like, like, like, like);
    }
    sql += ' ORDER BY c.nome LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const rows = await query(sql, params);
    res.json(rows);
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const cliente = await queryOne('SELECT * FROM clientes WHERE id = ?', [req.params.id]);
    if (!cliente) throw new HttpError(404, 'Cliente não encontrado');
    cliente.veiculos = await query(
      'SELECT * FROM veiculos WHERE cliente_id = ? ORDER BY created_at DESC',
      [req.params.id]
    );
    res.json(cliente);
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const data = clienteSchema.parse(req.body);
    const email = data.email || null;
    const result = await query(
      `INSERT INTO clientes (nome, cpf_cnpj, telefone, email, endereco, cidade, observacoes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [data.nome, data.cpf_cnpj || null, data.telefone, email, data.endereco || null, data.cidade || null, data.observacoes || null]
    );
    const cliente = await queryOne('SELECT * FROM clientes WHERE id = ?', [result.insertId]);
    res.status(201).json(cliente);
  })
);

router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const data = clienteSchema.partial().parse(req.body);
    const fields = [];
    const params = [];
    for (const key of ['nome', 'cpf_cnpj', 'telefone', 'email', 'endereco', 'cidade', 'observacoes']) {
      if (data[key] !== undefined) {
        fields.push(`${key} = ?`);
        params.push(data[key] === '' ? null : data[key]);
      }
    }
    if (!fields.length) throw new HttpError(400, 'Nenhum campo para atualizar');
    params.push(req.params.id);
    await query(`UPDATE clientes SET ${fields.join(', ')} WHERE id = ?`, params);
    const cliente = await queryOne('SELECT * FROM clientes WHERE id = ?', [req.params.id]);
    if (!cliente) throw new HttpError(404, 'Cliente não encontrado');
    res.json(cliente);
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const hasNotas = await queryOne(
      'SELECT 1 FROM notas WHERE cliente_id = ? LIMIT 1',
      [req.params.id]
    );
    if (hasNotas) {
      throw new HttpError(409, 'Cliente tem notas emitidas — não pode ser removido');
    }
    await query('DELETE FROM clientes WHERE id = ?', [req.params.id]);
    res.json({ ok: true });
  })
);

// ========= Veículos aninhados =========

router.get(
  '/:id/veiculos',
  asyncHandler(async (req, res) => {
    const rows = await query(
      'SELECT * FROM veiculos WHERE cliente_id = ? ORDER BY created_at DESC',
      [req.params.id]
    );
    res.json(rows);
  })
);

router.post(
  '/:id/veiculos',
  asyncHandler(async (req, res) => {
    const clienteId = Number(req.params.id);
    const cliente = await queryOne('SELECT id FROM clientes WHERE id = ?', [clienteId]);
    if (!cliente) throw new HttpError(404, 'Cliente não encontrado');

    const data = veiculoSchema.parse(req.body);
    const result = await query(
      `INSERT INTO veiculos (cliente_id, placa, modelo, ano, cor, observacoes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [clienteId, data.placa.toUpperCase(), data.modelo, data.ano || null, data.cor || null, data.observacoes || null]
    );
    const veiculo = await queryOne('SELECT * FROM veiculos WHERE id = ?', [result.insertId]);
    res.status(201).json(veiculo);
  })
);

router.put(
  '/:id/veiculos/:veiculoId',
  asyncHandler(async (req, res) => {
    const data = veiculoSchema.partial().parse(req.body);
    const fields = [];
    const params = [];
    for (const key of ['placa', 'modelo', 'ano', 'cor', 'observacoes']) {
      if (data[key] !== undefined) {
        fields.push(`${key} = ?`);
        params.push(key === 'placa' && data[key] ? data[key].toUpperCase() : data[key]);
      }
    }
    if (!fields.length) throw new HttpError(400, 'Nenhum campo para atualizar');
    params.push(req.params.veiculoId, req.params.id);
    await query(
      `UPDATE veiculos SET ${fields.join(', ')} WHERE id = ? AND cliente_id = ?`,
      params
    );
    const veiculo = await queryOne('SELECT * FROM veiculos WHERE id = ?', [req.params.veiculoId]);
    if (!veiculo) throw new HttpError(404, 'Veículo não encontrado');
    res.json(veiculo);
  })
);

router.delete(
  '/:id/veiculos/:veiculoId',
  asyncHandler(async (req, res) => {
    await query(
      'DELETE FROM veiculos WHERE id = ? AND cliente_id = ?',
      [req.params.veiculoId, req.params.id]
    );
    res.json({ ok: true });
  })
);

export default router;
