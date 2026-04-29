/**
 * Migration: Add deleted_at column to prospects table
 */

exports.up = (pgm) => {
  pgm.sql(`
    ALTER TABLE prospects
      ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL;
  `);
};

exports.down = (pgm) => {
  pgm.dropColumn('prospects', 'deleted_at', { ifExists: true });
};
