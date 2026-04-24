import express from 'express';
import { z } from 'zod';
import { query, queryOne } from '../db/pool.js';
import { authRequired, requireRole } from '../middleware/auth.js';
import { asyncHandler, HttpError } from '../middleware/errors.js';

const router = express.Router();

const mecanicoSchema = z.object({
  nome: z.string().min(2).max(120),
  telefone: z.string().max(20).optional().nullable(),
  email: z.string().email().max(160).optional().nullable().or(z.literal('')),
  especialidade: z.string().max(120).optional().nullable(),
  ativo: z.boolean().optional().default(true),
  observacoes: z.string().optional().nullable(),
});

router.use(authRequired);

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const onlyActive = req.query.ativo === '1';
    let sql = `
      SELECT m.*,
        (SELECT COUNT(*) FROM notas n WHERE n.mecanico_id = m.id) AS notas_count
      FROM mecanicos m`;
    if (onlyActive) sql += ' WHERE m.ativo = 1';
    sql += ' ORDER BY m.nome';
    const rows = await query(sql);
    res.json(rows);
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const mecanico = await queryOne('SELECT * FROM mecanicos WHERE id = ?', [req.params.id]);
    if (!mecanico) throw new HttpError(404, 'Mecânico não encontrado');
    res.json(mecanico);
  })
);

router.post(
  '/',
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const data = mecanicoSchema.parse(req.body);
    const result = await query(
      `INSERT INTO mecanicos (nome, telefone, email, especialidade, ativo, observacoes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        data.nome,
        data.telefone || null,
        data.email || null,
        data.especialidade || null,
        data.ativo ? 1 : 0,
        data.observacoes || null,
      ]
    );
    const mecanico = await queryOne('SELECT * FROM mecanicos WHERE id = ?', [result.insertId]);
    res.status(201).json(mecanico);
  })
);

router.put(
  '/:id',
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const data = mecanicoSchema.partial().parse(req.body);
    const fields = [];
    const params = [];
    for (const key of ['nome', 'telefone', 'email', 'especialidade', 'observacoes']) {
      if (data[key] !== undefined) {
        fields.push(`${key} = ?`);
        params.push(data[key] === '' ? null : data[key]);
      }
    }
    if (data.ativo !== undefined) {
      fields.push('ativo = ?');
      params.push(data.ativo ? 1 : 0);
    }
    if (!fields.length) throw new HttpError(400, 'Nenhum campo para atualizar');
    params.push(req.params.id);
    await query(`UPDATE mecanicos SET ${fields.join(', ')} WHERE id = ?`, params);
    const mecanico = await queryOne('SELECT * FROM mecanicos WHERE id = ?', [req.params.id]);
    if (!mecanico) throw new HttpError(404, 'Mecânico não encontrado');
    res.json(mecanico);
  })
);

router.delete(
  '/:id',
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const hasNotas = await queryOne(
      'SELECT 1 FROM notas WHERE mecanico_id = ? LIMIT 1',
      [req.params.id]
    );
    if (hasNotas) {
      // Se tem histórico, só desativa
      await query('UPDATE mecanicos SET ativo = 0 WHERE id = ?', [req.params.id]);
      return res.json({ ok: true, desativado: true });
    }
    await query('DELETE FROM mecanicos WHERE id = ?', [req.params.id]);
    res.json({ ok: true });
  })
);

export default router;
