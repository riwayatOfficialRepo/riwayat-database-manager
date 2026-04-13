/**
 * Migration: Drop is_record_changed column from kitchen tables
 */

const TABLES = [
  'kitchen_addresses',
  'kitchen_addresses_staging',
  'kitchen_availability',
  'kitchen_availability_staging',
];

exports.up = (pgm) => {
  for (const table of TABLES) {
    pgm.sql(`
      DO $$ BEGIN
        ALTER TABLE ${table} DROP COLUMN IF EXISTS is_record_changed;
      EXCEPTION WHEN undefined_column THEN NULL;
      END $$;
    `);
  }
};

exports.down = (pgm) => {
  for (const table of TABLES) {
    pgm.sql(`
      DO $$ BEGIN
        ALTER TABLE ${table}
          ADD COLUMN IF NOT EXISTS is_record_changed boolean DEFAULT false;
      EXCEPTION WHEN duplicate_column THEN NULL;
      END $$;
    `);
  }
};
