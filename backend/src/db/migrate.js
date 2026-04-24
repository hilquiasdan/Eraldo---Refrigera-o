import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDb, closeDb, save } from './pool.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsDir = path.resolve(__dirname, '../../migrations');

export async function runMigrations({ silent = false } = {}) {
  const db = await getDb();

  // Tabela de controle
  db.exec(`
    CREATE TABLE IF NOT EXISTS _migrations (
      filename TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    );
  `);

  // Lê migrations já aplicadas
  const res = db.exec('SELECT filename FROM _migrations');
  const applied = new Set(
    res.length ? res[0].values.map((row) => row[0]) : []
  );

  const files = fs.readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  let count = 0;
  for (const file of files) {
    if (applied.has(file)) continue;
    if (!silent) console.log(`> Aplicando ${file}...`);
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    db.exec('BEGIN');
    try {
      db.exec(sql);
      const stmt = db.prepare('INSERT INTO _migrations (filename) VALUES (?)');
      stmt.bind([file]);
      stmt.step();
      stmt.free();
      db.exec('COMMIT');
      if (!silent) console.log('  ✓ ok');
      count++;
    } catch (err) {
      try { db.exec('ROLLBACK'); } catch (_) {}
      throw new Error(`Falha em ${file}: ${err.message}`);
    }
  }

  if (count > 0) save(); // persiste imediatamente após migrations

  if (!silent) {
    if (count === 0) console.log('Nenhuma migration nova.');
    else console.log(`\n${count} migration(s) aplicada(s).`);
  }
  return count;
}

// CLI: `node src/db/migrate.js`
const isMain = import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  try {
    await runMigrations();
    closeDb();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
