/**
 * Migration: Add request_name column to change_requests table
 */

exports.up = (pgm) => {
  pgm.sql(`
    ALTER TABLE change_requests
      ADD COLUMN IF NOT EXISTS request_name VARCHAR(255) NULL;
  `);
};

exports.down = (pgm) => {
  pgm.dropColumn('change_requests', 'request_name', { ifExists: true });
};
