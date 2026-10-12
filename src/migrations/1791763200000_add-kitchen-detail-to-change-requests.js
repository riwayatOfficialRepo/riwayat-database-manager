/**
 * Migration: Add kitchen_detail column to change_requests table
 */

exports.up = (pgm) => {
  pgm.sql(`
    ALTER TABLE change_requests
      ADD COLUMN IF NOT EXISTS kitchen_detail JSONB NULL;
  `);
};

exports.down = (pgm) => {
  pgm.dropColumn('change_requests', 'kitchen_detail', { ifExists: true });
};
