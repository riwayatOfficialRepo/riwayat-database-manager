/**
 * Migration: Add change_in_progress column to kitchen_addresses,
 * kitchen_addresses_staging, kitchen_availability,
 * kitchen_availability_staging, and kitchens tables
 */

const TABLES = [
  'kitchen_addresses',
  'kitchen_addresses_staging',
  'kitchen_availability',
  'kitchen_availability_staging',
  'kitchens_staging',
  'kitchens',
];

exports.up = (pgm) => {
  for (const table of TABLES) {
    pgm.sql(`
      DO $$ BEGIN
        ALTER TABLE ${table}
          ADD COLUMN IF NOT EXISTS change_in_progress boolean DEFAULT false;
      EXCEPTION WHEN duplicate_column THEN NULL;
      END $$;
    `);
  }
};

exports.down = (pgm) => {
  for (const table of TABLES) {
    pgm.dropColumn(table, 'change_in_progress', { ifExists: true });
  }
};
