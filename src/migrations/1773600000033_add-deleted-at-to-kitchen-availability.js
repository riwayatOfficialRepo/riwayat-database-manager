/**
 * Migration: Add deleted_at column to kitchen_availability and kitchen_availability_staging tables
 */

exports.up = (pgm) => {
  pgm.sql(`
    ALTER TABLE kitchen_availability
      ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL;

    ALTER TABLE kitchen_availability_staging
      ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL;
  `);
};

exports.down = (pgm) => {
  pgm.dropColumn('kitchen_availability', 'deleted_at', { ifExists: true });
  pgm.dropColumn('kitchen_availability_staging', 'deleted_at', { ifExists: true });
};
