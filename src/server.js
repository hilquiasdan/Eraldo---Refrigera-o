import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import fs from 'fs';

import { runMigrations } from './db/migrate.js';
import authRoutes from './routes/auth.js';
import usersRoutes from './routes/users.js';
import clientesRoutes from './routes/clientes.js';
import mecanicosRoutes from './routes/mecanicos.js';
import servicosRoutes from './routes/servicos.js';
import notasRoutes from './routes/notas.js';
import dashboardRoutes from './routes/dashboard.js';
import configRoutes from './routes/config.js';
import { notFound, errorHandler } from './middleware/errors.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(' Eraldo Refrigeração — iniciando servidor');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// 1. Carrega .env (preferência) ou .env.production (fallback)
const envPath = path.join(rootDir, '.env');
const envProdPath = path.join(rootDir, '.env.production');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
  console.log(`✓ .env carregado de ${envPath}`);
} else if (fs.existsSync(envProdPath)) {
  dotenv.config({ path: envProdPath });
  console.log(`✓ .env.production carregado (renomeie para .env quando puder)`);
} else {
  console.log('⚠ Nenhum .env encontrado — usando defaults');
}

// 2. JWT_SECRET — auto-gera e persiste se não existir (não exige config)
function ensureJwtSecret() {
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length >= 32 && !process.env.JWT_SECRET.includes('GERE-UMA')) {
    return;
  }
  const secretFile = path.join(rootDir, 'data', '.jwt-secret');
  fs.mkdirSync(path.dirname(secretFile), { recursive: true });
  if (fs.existsSync(secretFile)) {
    process.env.JWT_SECRET = fs.readFileSync(secretFile, 'utf8').trim();
    console.log('✓ JWT_SECRET lido de data/.jwt-secret');
  } else {
    const generated = crypto.randomBytes(48).toString('hex');
    fs.writeFileSync(secretFile, generated, { mode: 0o600 });
    process.env.JWT_SECRET = generated;
    console.log('✓ JWT_SECRET gerado e salvo em data/.jwt-secret');
  }
}
ensureJwtSecret();

// 3. NODE_ENV default = production
if (!process.env.NODE_ENV) process.env.NODE_ENV = 'production';

// 4. CORS_ORIGIN — limpa placeholders, aceita * se não configurado
function parseCorsOrigins() {
  const raw = process.env.CORS_ORIGIN || '';
  const origins = raw
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s && !s.includes('[') && !s.includes('SEU_DOMINIO'));

  if (origins.length === 0) {
    console.log('⚠ CORS_ORIGIN não configurado — aceitando qualquer origem (não ideal em produção)');
    return true; // cors aceita true = qualquer origem
  }
  return origins;
}
const corsOrigin = parseCorsOrigins();

// 5. Migrations
try {
  await runMigrations({ silent: false });
} catch (err) {
  console.error('✗ Falha ao rodar migrations:', err.message);
  console.error(err.stack);
  process.exit(1);
}

// 6. Express app
const app = express();

app.use(cors({ origin: corsOrigin, credentials: true }));
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

// 7. Frontend estático (sempre que public/ existir, independente de NODE_ENV)
const staticDir = path.resolve(rootDir, 'public');
if (fs.existsSync(staticDir)) {
  app.use(express.static(staticDir));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    res.sendFile(path.join(staticDir, 'index.html'));
  });
  console.log(`✓ Frontend servido de ${staticDir}`);
} else {
  console.log(`⚠ Pasta public/ não encontrada em ${staticDir}`);
}

app.use('/api', notFound);
app.use(errorHandler);

// 8. Listen
const port = Number(process.env.PORT) || 3001;
app.listen(port, () => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(` ✓ API rodando na porta ${port}`);
  console.log(` ✓ NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(` ✓ CORS: ${corsOrigin === true ? '* (qualquer origem)' : corsOrigin.join(', ')}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});

// Captura erros não tratados em vez de derrubar o processo silenciosamente
process.on('uncaughtException', (err) => {
  console.error('✗ uncaughtException:', err);
});
process.on('unhandledRejection', (reason) => {
  console.error('✗ unhandledRejection:', reason);
});
