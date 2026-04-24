import express from 'express';
import { z } from 'zod';
import { query, queryOne } from '../db/pool.js';
import { authRequired, requireRole } from '../middleware/auth.js';
import { asyncHandler, HttpError } from '../middleware/errors.js';

const router = express.Router();

const servicoSchema = z.object({
  titulo: z.string().min(2).max(160),
  descricao: z.string().optional().nullable(),
  valor_padrao: z.number().min(0).or(z.string().transform(Number)),
  ativo: z.boolean().optional().default(true),
  ordem: z.number().int().optional().default(0),
});

router.use(authRequired);

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const onlyActive = req.query.ativo === '1';
    let sql = 'SELECT * FROM servicos_padrao';
    if (onlyActive) sql += ' WHERE ativo = 1';
    sql += ' ORDER BY ordem, titulo';
    const rows = await query(sql);
    res.json(rows);
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const servico = await queryOne('SELECT * FROM servicos_padrao WHERE id = ?', [req.params.id]);
    if (!servico) throw new HttpError(404, 'Serviço não encontrado');
    res.json(servico);
  })
);

router.post(
  '/',
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const data = servicoSchema.parse(req.body);
    const result = await query(
      `INSERT INTO servicos_padrao (titulo, descricao, valor_padrao, ativo, ordem)
       VALUES (?, ?, ?, ?, ?)`,
      [data.titulo, data.descricao || null, data.valor_padrao, data.ativo ? 1 : 0, data.ordem || 0]
    );
    const servico = await queryOne('SELECT * FROM servicos_padrao WHERE id = ?', [result.insertId]);
    res.status(201).json(servico);
  })
);

router.put(
  '/:id',
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const data = servicoSchema.partial().parse(req.body);
    const fields = [];
    const params = [];
    for (const key of ['titulo', 'descricao', 'valor_padrao', 'ordem']) {
      if (data[key] !== undefined) {
        fields.push(`${key} = ?`);
        params.push(data[key]);
      }
    }
    if (data.ativo !== undefined) {
      fields.push('ativo = ?');
      params.push(data.ativo ? 1 : 0);
    }
    if (!fields.length) throw new HttpError(400, 'Nenhum campo para atualizar');
    params.push(req.params.id);
    await query(`UPDATE servicos_padrao SET ${fields.join(', ')} WHERE id = ?`, params);
    const servico = await queryOne('SELECT * FROM servicos_padrao WHERE id = ?', [req.params.id]);
    if (!servico) throw new HttpError(404, 'Serviço não encontrado');
    res.json(servico);
  })
);

router.delete(
  '/:id',
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    // Se tem histórico em notas, só desativa
    const hasItens = await queryOne(
      'SELECT 1 FROM nota_itens WHERE servico_id = ? LIMIT 1',
      [req.params.id]
    );
    if (hasItens) {
      await query('UPDATE servicos_padrao SET ativo = 0 WHERE id = ?', [req.params.id]);
      return res.json({ ok: true, desativado: true });
    }
    await query('DELETE FROM servicos_padrao WHERE id = ?', [req.params.id]);
    res.json({ ok: true });
  })
);

export default router;
