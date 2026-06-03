/**
 * verify-migrations.js
 *
 * Checks every completed migration against the live database.
 * If a migration created tables that no longer exist it removes the
 * pgmigrations record so `npm run migrate` will re-run it automatically.
 *
 * Usage:
 *   node src/scripts/verify-migrations.js          # check + auto-repair
 *   node src/scripts/verify-migrations.js --dry-run # report only, no changes
 */

const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.resolve(process.cwd(), ".env") });

const DRY_RUN = process.argv.includes("--dry-run");
const MIGRATIONS_DIR = path.join(__dirname, "../migrations");

function getTablesFromMigrationFile(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const tables = new Set();

  // pgm.createTable('table_name', ...) or pgm.createTable("table_name", ...)
  const pgmCreate = /pgm\.createTable\(\s*['"]([^'"]+)['"]/g;
  let match;
  while ((match = pgmCreate.exec(content)) !== null) {
    tables.add(match[1]);
  }

  // CREATE TABLE IF NOT EXISTS "table_name"
  const sqlCreate = /CREATE TABLE IF NOT EXISTS "?([a-zA-Z_][a-zA-Z0-9_]*)"?/g;
  while ((match = sqlCreate.exec(content)) !== null) {
    tables.add(match[1]);
  }

  return [...tables];
}

async function tableExists(pool, tableName) {
  const { rows } = await pool.query(
    `SELECT 1 FROM information_schema.tables
     WHERE table_schema = 'public' AND table_name = $1`,
    [tableName],
  );
  return rows.length > 0;
}

async function verify() {
  const connectionString =
    process.env.POSTGRES_URL || process.env.DATABASE_URL;

  if (!connectionString) {
    console.error("No database connection string found in environment.");
    process.exit(1);
  }

  const pool = new Pool({ connectionString });

  try {
    // Check pgmigrations table exists at all
    const { rows: tableCheck } = await pool.query(
      `SELECT 1 FROM information_schema.tables
       WHERE table_schema = 'public' AND table_name = 'pgmigrations'`,
    );
    if (tableCheck.length === 0) {
      console.log("pgmigrations table not found — no migrations have run yet.");
      return;
    }

    const { rows: completed } = await pool.query(
      "SELECT name FROM pgmigrations ORDER BY run_on ASC",
    );

    if (completed.length === 0) {
      console.log("No completed migrations found.");
      return;
    }

    const migrationFiles = fs
      .readdirSync(MIGRATIONS_DIR)
      .filter((f) => f.endsWith(".js"))
      .reduce((map, f) => {
        // key = migration name without .js
        map[f.replace(/\.js$/, "")] = path.join(MIGRATIONS_DIR, f);
        return map;
      }, {});

    let missingCount = 0;

    for (const { name } of completed) {
      const filePath = migrationFiles[name];

      if (!filePath) {
        console.warn(`  [WARN] Migration file not found for recorded entry: ${name}`);
        continue;
      }

      const tables = getTablesFromMigrationFile(filePath);

      if (tables.length === 0) {
        // Migration only modifies columns/constraints — no table to verify
        continue;
      }

      const missing = [];
      for (const table of tables) {
        if (!(await tableExists(pool, table))) {
          missing.push(table);
        }
      }

      if (missing.length > 0) {
        missingCount++;
        console.log(`  [MISSING] ${name}`);
        console.log(`            Tables gone: ${missing.join(", ")}`);

        if (!DRY_RUN) {
          await pool.query("DELETE FROM pgmigrations WHERE name = $1", [name]);
          console.log(`            → Removed from pgmigrations. Will re-run on next migrate.`);
        }
      }
    }

    if (missingCount === 0) {
      console.log("All migrated tables verified — database is consistent.");
    } else if (DRY_RUN) {
      console.log(`\n${missingCount} migration(s) have missing tables. Run without --dry-run to repair.`);
    } else {
      console.log(`\nRepaired ${missingCount} migration(s). Run npm run migrate to recreate missing tables.`);
    }
  } finally {
    await pool.end();
  }
}

verify().catch((err) => {
  console.error("Verify failed:", err.message);
  process.exit(1);
});
