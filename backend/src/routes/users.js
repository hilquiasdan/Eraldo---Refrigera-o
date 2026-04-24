import express from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { query, queryOne } from '../db/pool.js';
import { authRequired, requireRole } from '../middleware/auth.js';
import { asyncHandler, HttpError } from '../middleware/errors.js';

const router = express.Router();

const userSchema = z.object({
  nome: z.string().min(2).max(120),
  email: z.string().email().max(160),
  senha: z.string().min(6).max(72).optional(),
  role: z.enum(['admin', 'mecanico', 'atendente']),
  ativo: z.boolean().optional().default(true),
});

router.use(authRequired, requireRole('admin'));

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const rows = await query(
      `SELECT id, nome, email, role, ativo, ultimo_acesso, created_at
       FROM users ORDER BY nome`
    );
    res.json(rows);
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const data = userSchema.parse(req.body);
    if (!data.senha) throw new HttpError(400, 'Senha é obrigatória ao criar usuário');
    const hash = bcrypt.hashSync(data.senha, 10);
    const result = await query(
      `INSERT INTO users (nome, email, senha_hash, role, ativo)
       VALUES (?, ?, ?, ?, ?)`,
      [data.nome, data.email, hash, data.role, data.ativo ? 1 : 0]
    );
    const user = await queryOne(
      'SELECT id, nome, email, role, ativo FROM users WHERE id = ?',
      [result.insertId]
    );
    res.status(201).json(user);
  })
);

router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const data = userSchema.partial().parse(req.body);

    const fields = [];
    const params = [];

    if (data.nome !== undefined) { fields.push('nome = ?'); params.push(data.nome); }
    if (data.email !== undefined) { fields.push('email = ?'); params.push(data.email); }
    if (data.role !== undefined) { fields.push('role = ?'); params.push(data.role); }
    if (data.ativo !== undefined) { fields.push('ativo = ?'); params.push(data.ativo ? 1 : 0); }
    if (data.senha) {
      fields.push('senha_hash = ?');
      params.push(bcrypt.hashSync(data.senha, 10));
    }

    if (!fields.length) throw new HttpError(400, 'Nenhum campo para atualizar');
    params.push(id);
    await query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, params);

    const user = await queryOne(
      'SELECT id, nome, email, role, ativo FROM users WHERE id = ?',
      [id]
    );
    if (!user) throw new HttpError(404, 'Usuário não encontrado');
    res.json(user);
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (id === req.user.sub) {
      throw new HttpError(400, 'Você não pode remover seu próprio usuário');
    }
    // Soft delete: desativa em vez de remover (preserva histórico de notas)
    await query('UPDATE users SET ativo = 0 WHERE id = ?', [id]);
    res.json({ ok: true });
  })
);

export default router;
