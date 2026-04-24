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

// =====================================================================
// LOGGING — escreve em console E em data/server.log
// (Hostinger às vezes não mostra stdout do Passenger; arquivo sempre vê)
// =====================================================================
const logsDir = path.join(rootDir, 'data');
try { fs.mkdirSync(logsDir, { recursive: true }); } catch (_) {}
const logFile = path.join(logsDir, 'server.log');

function log(...args) {
  const msg = args.map((a) => typeof a === 'string' ? a : JSON.stringify(a)).join(' ');
  const line = `[${new Date().toISOString()}] ${msg}\n`;
  process.stdout.write(line);
  try { fs.appendFileSync(logFile, line); } catch (_) {}
}

function logError(...args) {
  const msg = args.map((a) => {
    if (a instanceof Error) return `${a.message}\n${a.stack}`;
    return typeof a === 'string' ? a : JSON.stringify(a);
  }).join(' ');
  const line = `[${new Date().toISOString()}] ERROR: ${msg}\n`;
  process.stderr.write(line);
  try { fs.appendFileSync(logFile, line); } catch (_) {}
}

log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
log(' Eraldo Refrigeração — iniciando servidor');
log(`  Node: ${process.version} | PID: ${process.pid} | cwd: ${process.cwd()}`);
log(`  rootDir: ${rootDir}`);
log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// Captura erros não tratados ANTES de qualquer coisa que possa quebrar
process.on('uncaughtException', (err) => {
  logError('uncaughtException:', err);
});
process.on('unhandledRejection', (reason) => {
  logError('unhandledRejection:', reason);
});

// =====================================================================
// 1. .env (carrega .env, ou .env.production como fallback)
// =====================================================================
const envPath = path.join(rootDir, '.env');
const envProdPath = path.join(rootDir, '.env.production');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
  log('✓ .env carregado');
} else if (fs.existsSync(envProdPath)) {
  dotenv.config({ path: envProdPath });
  log('✓ .env.production carregado (fallback)');
} else {
  log('⚠ Nenhum .env encontrado — usando defaults');
}

// =====================================================================
// 2. JWT_SECRET — auto-gera se faltar
// =====================================================================
function ensureJwtSecret() {
  const isValid = process.env.JWT_SECRET
    && process.env.JWT_SECRET.length >= 32
    && !process.env.JWT_SECRET.includes('GERE-UMA');
  if (isValid) return;

  const secretFile = path.join(rootDir, 'data', '.jwt-secret');
  fs.mkdirSync(path.dirname(secretFile), { recursive: true });
  if (fs.existsSync(secretFile)) {
    process.env.JWT_SECRET = fs.readFileSync(secretFile, 'utf8').trim();
    log('✓ JWT_SECRET lido de data/.jwt-secret');
  } else {
    const generated = crypto.randomBytes(48).toString('hex');
    fs.writeFileSync(secretFile, generated, { mode: 0o600 });
    process.env.JWT_SECRET = generated;
    log('✓ JWT_SECRET gerado e salvo em data/.jwt-secret');
  }
}
try {
  ensureJwtSecret();
} catch (err) {
  logError('Falha ao gerar JWT_SECRET, usando valor em memória:', err.message);
  process.env.JWT_SECRET = crypto.randomBytes(48).toString('hex');
}

// =====================================================================
// 3. NODE_ENV default
// =====================================================================
if (!process.env.NODE_ENV) process.env.NODE_ENV = 'production';

// =====================================================================
// 4. CORS — limpa placeholders, aceita * se vazio
// =====================================================================
function parseCorsOrigins() {
  const raw = process.env.CORS_ORIGIN || '';
  const origins = raw
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s && !s.includes('[') && !s.includes('SEU_DOMINIO'));
  if (origins.length === 0) {
    log('⚠ CORS_ORIGIN não configurado — aceitando qualquer origem');
    return true;
  }
  return origins;
}
const corsOrigin = parseCorsOrigins();

// =====================================================================
// 5. Migrations — não derruba o servidor se falhar (registra e continua)
// =====================================================================
try {
  await runMigrations({ silent: false });
  log('✓ Migrations OK');
} catch (err) {
  logError('Falha ao rodar migrations (servidor continua subindo mesmo assim):', err);
}

// =====================================================================
// 6. Express
// =====================================================================
const app = express();

app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.disable('x-powered-by');

// Health check no root TAMBÉM (Hostinger usa pra testar)
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

// Frontend estático
const staticDir = path.resolve(rootDir, 'public');
if (fs.existsSync(staticDir)) {
  app.use(express.static(staticDir));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    res.sendFile(path.join(staticDir, 'index.html'));
  });
  log(`✓ Frontend servido de ${staticDir}`);
} else {
  log(`⚠ Pasta public/ não encontrada em ${staticDir}`);
}

app.use('/api', notFound);
app.use(errorHandler);

// =====================================================================
// 7. Listen — aceita PORT como número OU como caminho de socket
// (Passenger às vezes passa um socket Unix em vez de uma porta numérica)
// =====================================================================
const portRaw = process.env.PORT;
let listenArg;
if (!portRaw) {
  listenArg = 3001; // fallback dev local
} else if (/^\d+$/.test(String(portRaw))) {
  listenArg = Number(portRaw); // porta numérica
} else {
  listenArg = portRaw; // caminho de socket Unix
}

const server = app.listen(listenArg, () => {
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  log(` ✓ Servidor escutando em ${typeof listenArg === 'number' ? `porta ${listenArg}` : `socket ${listenArg}`}`);
  log(` ✓ NODE_ENV: ${process.env.NODE_ENV}`);
  log(` ✓ CORS: ${corsOrigin === true ? '* (qualquer origem)' : corsOrigin.join(', ')}`);
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});

server.on('error', (err) => {
  logError('Erro no servidor HTTP:', err);
});

// Para Passenger e ambientes que querem o app exportado
export default app;
