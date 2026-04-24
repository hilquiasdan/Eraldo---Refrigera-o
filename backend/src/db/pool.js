import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(__dirname, '../../data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
const dbPath = path.join(dataDir, 'eraldo.db');

let SQL = null;
let db = null;
let saveTimer = null;
let initPromise = null;

async function doInit() {
  SQL = await initSqlJs();
  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }
  db.exec('PRAGMA foreign_keys = ON');
}

export async function init() {
  if (db) return db;
  if (!initPromise) initPromise = doInit();
  await initPromise;
  return db;
}

function saveDbSync() {
  if (!db) return;
  const data = db.export();
  // Escrita atômica: escreve em .tmp, depois renomeia (evita corrupção se crashar no meio)
  const tmp = dbPath + '.tmp';
  fs.writeFileSync(tmp, Buffer.from(data));
  fs.renameSync(tmp, dbPath);
}

function scheduleSave() {
  if (saveTimer) return;
  saveTimer = setTimeout(() => {
    saveTimer = null;
    try { saveDbSync(); } catch (e) { console.error('Falha ao salvar banco:', e.message); }
  }, 200);
}

function flushSave() {
  if (saveTimer) {
    clearTimeout(saveTimer);
    saveTimer = null;
  }
  saveDbSync();
}

function isSelect(sql) {
  return /^\s*(SELECT|WITH|PRAGMA)/i.test(sql);
}

function runSelect(sqlText, params) {
  const stmt = db.prepare(sqlText);
  try {
    stmt.bind(params);
    const rows = [];
    while (stmt.step()) rows.push(stmt.getAsObject());
    return rows;
  } finally {
    stmt.free();
  }
}

function runWrite(sqlText, params) {
  const stmt = db.prepare(sqlText);
  try {
    stmt.bind(params);
    stmt.step();
  } finally {
    stmt.free();
  }
  const affectedRows = db.getRowsModified();
  const res = db.exec('SELECT last_insert_rowid() AS id');
  const insertId = res.length && res[0].values.length ? Number(res[0].values[0][0]) : 0;
  return { insertId, affectedRows };
}

export async function query(sql, params = []) {
  await init();
  if (isSelect(sql)) {
    return runSelect(sql, params);
  }
  const result = runWrite(sql, params);
  scheduleSave();
  return result;
}

export async function queryOne(sql, params = []) {
  const result = await query(sql, params);
  if (Array.isArray(result)) return result[0] || null;
  return result;
}

// Conn wrapper para emular API mysql2 dentro de transactions
function makeConn() {
  return {
    async execute(sqlText, params = []) {
      if (isSelect(sqlText)) {
        return [runSelect(sqlText, params)];
      }
      return [runWrite(sqlText, params)];
    },
  };
}

export async function transaction(fn) {
  await init();
  const conn = makeConn();
  db.exec('BEGIN');
  try {
    const result = await fn(conn);
    db.exec('COMMIT');
    scheduleSave();
    return result;
  } catch (err) {
    try { db.exec('ROLLBACK'); } catch (_) {}
    throw err;
  }
}

// Acesso direto (usado em migrate.js)
export async function execRaw(sqlText) {
  await init();
  db.exec(sqlText);
  scheduleSave();
}

export async function getDb() {
  await init();
  return db;
}

// Exporta save explícito para casos como migrations que mexem direto no db
export function save() {
  flushSave();
}

export function closeDb() {
  try { flushSave(); } catch (_) {}
  if (db) { try { db.close(); } catch (_) {} db = null; }
}

// Garante salvar no shutdown
process.on('SIGINT', () => { closeDb(); process.exit(0); });
process.on('SIGTERM', () => { closeDb(); process.exit(0); });
process.on('beforeExit', () => { flushSave(); });
