import express from 'express';
import { z } from 'zod';
import { query, queryOne } from '../db/pool.js';
import { authRequired, requireRole } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errors.js';

const router = express.Router();

// Endpoint público (fica ANTES do authRequired global)
router.get(
  '/publica',
  asyncHandler(async (req, res) => {
    const keys = ['empresa_nome', 'empresa_endereco', 'empresa_cidade',
                  'empresa_telefone', 'empresa_email', 'empresa_horario', 'empresa_cnpj'];
    const placeholders = keys.map(() => '?').join(',');
    const rows = await query(
      `SELECT chave, valor FROM configuracoes WHERE chave IN (${placeholders})`,
      keys
    );
    const obj = {};
    for (const r of rows) obj[r.chave] = r.valor;
    res.json(obj);
  })
);

router.use(authRequired);

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const rows = await query('SELECT chave, valor FROM configuracoes');
    const obj = {};
    for (const r of rows) obj[r.chave] = r.valor;
    res.json(obj);
  })
);

router.put(
  '/',
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const schema = z.record(z.string().max(80), z.string().max(2000));
    const data = schema.parse(req.body);
    for (const [chave, valor] of Object.entries(data)) {
      await query(
        `INSERT INTO configuracoes (chave, valor) VALUES (?, ?)
         ON CONFLICT(chave) DO UPDATE SET valor = excluded.valor`,
        [chave, valor]
      );
    }
    const rows = await query('SELECT chave, valor FROM configuracoes');
    const obj = {};
    for (const r of rows) obj[r.chave] = r.valor;
    res.json(obj);
  })
);

export default router;
