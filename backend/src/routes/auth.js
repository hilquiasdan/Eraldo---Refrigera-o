import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { query, queryOne } from '../db/pool.js';
import { authRequired } from '../middleware/auth.js';
import { asyncHandler, HttpError } from '../middleware/errors.js';

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas tentativas. Tente novamente em alguns minutos.' },
});

const loginSchema = z.object({
  email: z.string().min(1, 'E-mail é obrigatório'),
  senha: z.string().min(1, 'Senha é obrigatória'),
});

function signToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role, nome: user.nome },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

router.post(
  '/login',
  loginLimiter,
  asyncHandler(async (req, res) => {
    const { email, senha } = loginSchema.parse(req.body);

    // Aceita email OU nome de usuário (para compatibilidade com o login "admin")
    const user = await queryOne(
      'SELECT id, nome, email, senha_hash, role, ativo FROM users WHERE email = ? OR nome = ? LIMIT 1',
      [email, email]
    );

    if (!user || !user.ativo) {
      throw new HttpError(401, 'Usuário ou senha inválidos');
    }

    const ok = await bcrypt.compare(senha, user.senha_hash);
    if (!ok) {
      throw new HttpError(401, 'Usuário ou senha inválidos');
    }

    await query('UPDATE users SET ultimo_acesso = NOW() WHERE id = ?', [user.id]);

    const token = signToken(user);
    res.json({
      token,
      user: { id: user.id, nome: user.nome, email: user.email, role: user.role },
    });
  })
);

router.get(
  '/me',
  authRequired,
  asyncHandler(async (req, res) => {
    const user = await queryOne(
      'SELECT id, nome, email, role, ativo, ultimo_acesso FROM users WHERE id = ?',
      [req.user.sub]
    );
    if (!user) throw new HttpError(404, 'Usuário não encontrado');
    res.json(user);
  })
);

router.post(
  '/logout',
  authRequired,
  asyncHandler(async (req, res) => {
    // Stateless JWT — cliente descarta o token. Endpoint existe para coerência.
    res.json({ ok: true });
  })
);

export default router;
