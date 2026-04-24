import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(__dirname, '../../data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const dbPath = path.join(dataDir, 'eraldo.db');

export const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
db.pragma('synchronous = NORMAL');

function isSelect(sql) {
  return /^\s*(SELECT|WITH|PRAGMA)/i.test(sql);
}

// Mantém compatibilidade com a API antiga (mysql2-like) para não reescrever as rotas.
// SELECT  → retorna array de rows
// outros  → retorna { insertId, affectedRows }
export async function query(sql, params = []) {
  const stmt = db.prepare(sql);
  if (isSelect(sql)) {
    return stmt.all(...params);
  }
  const result = stmt.run(...params);
  return {
    insertId: Number(result.lastInsertRowid),
    affectedRows: result.changes,
  };
}

export async function queryOne(sql, params = []) {
  const result = await query(sql, params);
  if (Array.isArray(result)) return result[0] || null;
  return result;
}

// Connection-like wrapper para emular a API mysql2 dentro de uma transaction.
// .execute(sql, params) retorna [rowsOrResult] (mesmo formato do mysql2 destruturado)
function makeConn() {
  return {
    async execute(sql, params = []) {
      const stmt = db.prepare(sql);
      if (isSelect(sql)) {
        return [stmt.all(...params)];
      }
      const result = stmt.run(...params);
      return [{
        insertId: Number(result.lastInsertRowid),
        affectedRows: result.changes,
      }];
    },
  };
}

// Transação: better-sqlite3 é síncrono, mas precisamos suportar fn assíncrona.
// Usamos BEGIN/COMMIT/ROLLBACK manuais.
export async function transaction(fn) {
  const conn = makeConn();
  db.exec('BEGIN');
  try {
    const result = await fn(conn);
    db.exec('COMMIT');
    return result;
  } catch (err) {
    try { db.exec('ROLLBACK'); } catch (_) { /* ignore */ }
    throw err;
  }
}

// Para encerrar limpo no shutdown (opcional)
export function closeDb() {
  db.close();
}
