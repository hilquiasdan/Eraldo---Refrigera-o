import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

import authRoutes from './routes/auth.js';
import usersRoutes from './routes/users.js';
import clientesRoutes from './routes/clientes.js';
import mecanicosRoutes from './routes/mecanicos.js';
import servicosRoutes from './routes/servicos.js';
import notasRoutes from './routes/notas.js';
import dashboardRoutes from './routes/dashboard.js';
import configRoutes from './routes/config.js';
import { notFound, errorHandler } from './middleware/errors.js';

dotenv.config();

if (!process.env.JWT_SECRET) {
  console.error('ERRO: JWT_SECRET não configurado no .env');
  process.exit(1);
}

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const origins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

app.use(cors({ origin: origins, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.disable('x-powered-by');

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/mecanicos', mecanicosRoutes);
app.use('/api/servicos', servicosRoutes);
app.use('/api/notas', notasRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/config', configRoutes);

// Em produção, serve o frontend buildado (opcional — permite deploy único)
const staticDir = path.resolve(__dirname, '../../frontend/dist');
if (process.env.NODE_ENV === 'production' && fs.existsSync(staticDir)) {
  app.use(express.static(staticDir));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    res.sendFile(path.join(staticDir, 'index.html'));
  });
}

app.use('/api', notFound);
app.use(errorHandler);

const port = Number(process.env.PORT) || 3001;
app.listen(port, () => {
  console.log(`API rodando em http://localhost:${port}`);
  console.log(`CORS origins: ${origins.join(', ')}`);
});
