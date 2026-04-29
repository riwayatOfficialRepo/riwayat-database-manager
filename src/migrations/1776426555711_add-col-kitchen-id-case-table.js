/**
 * Migration: Add kitchen_id column to cases table
 */

exports.up = (pgm) => {
  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE cases ADD COLUMN kitchen_id UUID;
    EXCEPTION WHEN duplicate_column THEN NULL;
    END $$;
  `);
};

exports.down = (pgm) => {
  pgm.sql(`ALTER TABLE cases DROP COLUMN IF EXISTS kitchen_id`);
};
