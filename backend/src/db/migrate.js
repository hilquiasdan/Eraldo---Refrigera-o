import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { db, closeDb } from './pool.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsDir = path.resolve(__dirname, '../../migrations');

export function runMigrations({ silent = false } = {}) {
  // Tabela de controle
  db.exec(`
    CREATE TABLE IF NOT EXISTS _migrations (
      filename TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    );
  `);

  const applied = new Set(
    db.prepare('SELECT filename FROM _migrations').all().map((r) => r.filename)
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
      db.prepare('INSERT INTO _migrations (filename) VALUES (?)').run(file);
      db.exec('COMMIT');
      if (!silent) console.log(`  ✓ ok`);
      count++;
    } catch (err) {
      db.exec('ROLLBACK');
      throw new Error(`Falha em ${file}: ${err.message}`);
    }
  }

  if (!silent) {
    if (count === 0) console.log('Nenhuma migration nova.');
    else console.log(`\n${count} migration(s) aplicada(s).`);
  }
  return count;
}

// Permite rodar via CLI: `node src/db/migrate.js`
const isMain = import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  try {
    runMigrations();
    closeDb();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
