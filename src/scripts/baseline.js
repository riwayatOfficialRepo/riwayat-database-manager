/**
 * Migration Baseline Script
 *
 * Industry standard approach for existing databases.
 * Marks migrations as "done" for tables that already exist.
 *
 * Usage: npm run migrate:baseline
 */

const { pool, connectDB } = require('../database');
const logger = require('../logger');

// Migration to table mapping
const MIGRATIONS = [
  { name: '1737000000001_create-kitchens-table', table: 'kitchens' },
  { name: '1737000000002_create-kitchens-staging-table', table: 'kitchens_staging' },
  { name: '1737000000003_create-kitchen-users-table', table: 'kitchen_users' },
  { name: '1737000000004_create-kitchen-roles-table', table: 'kitchen_roles' },
  { name: '1737000000005_create-kitchen-user-roles-table', table: 'kitchen_user_roles' },
  { name: '1737000000006_create-kitchen-permissions-table', table: 'kitchen_permissions' },
  { name: '1737000000007_create-kitchen-role-permissions-table', table: 'kitchen_role_permissions' },
  { name: '1737000000008_create-kitchen-media-table', table: 'kitchen_media' },
  { name: '1737000000009_create-days-of-week-table', table: 'days_of_week' },
  { name: '1737000000010_create-kitchen-availability-slots-table', table: 'kitchen_availability_slots' },
  { name: '1737000000011_create-kitchen-addresses-table', table: 'kitchen_addresses' },
  { name: '1737000000012_create-kitchen-addresses-staging-table', table: 'kitchen_addresses_staging' },
  { name: '1737000000013_create-kitchen-availability-table', table: 'kitchen_availability' },
  { name: '1737000000014_create-kitchen-availability-staging-table', table: 'kitchen_availability_staging' },
];

async function tableExists(tableName) {
  const result = await pool.query(`
    SELECT EXISTS (
      SELECT FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name = $1
    )
  `, [tableName]);
  return result.rows[0].exists;
}

async function migrationRecorded(migrationName) {
  const result = await pool.query(`
    SELECT EXISTS (
      SELECT FROM pgmigrations
      WHERE name = $1
    )
  `, [migrationName]);
  return result.rows[0].exists;
}

async function ensureMigrationsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS pgmigrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      run_on TIMESTAMP NOT NULL
    )
  `);
}

async function baseline() {
  try {
    await connectDB();
    logger.info('Starting migration baseline...');

    // Ensure pgmigrations table exists
    await ensureMigrationsTable();
    logger.info('Migration tracking table ready');

    let baselined = 0;
    let skipped = 0;
    let notFound = 0;

    for (const migration of MIGRATIONS) {
      const exists = await tableExists(migration.table);
      const recorded = await migrationRecorded(migration.name);

      if (recorded) {
        logger.debug({ migration: migration.name }, 'Already recorded, skipping');
        skipped++;
        continue;
      }

      if (exists) {
        await pool.query(
          'INSERT INTO pgmigrations (name, run_on) VALUES ($1, NOW())',
          [migration.name]
        );
        logger.info({ migration: migration.name, table: migration.table }, 'Baselined');
        baselined++;
      } else {
        logger.warn({ migration: migration.name, table: migration.table }, 'Table not found, will run migration');
        notFound++;
      }
    }

    logger.info({
      baselined,
      skipped,
      pendingMigrations: notFound,
    }, 'Baseline complete');

    console.log('\n========================================');
    console.log('  BASELINE SUMMARY');
    console.log('========================================');
    console.log(`  Baselined:  ${baselined} migrations`);
    console.log(`  Skipped:    ${skipped} (already recorded)`);
    console.log(`  Pending:    ${notFound} (tables not found)`);
    console.log('========================================');
    console.log('\nRun "npm run migrate" to apply pending migrations.\n');

    process.exit(0);
  } catch (error) {
    logger.error({ error }, 'Baseline failed');
    console.error('Baseline failed:', error.message);
    process.exit(1);
  }
}

baseline();
