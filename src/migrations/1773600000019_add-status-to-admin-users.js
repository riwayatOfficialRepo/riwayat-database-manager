/**
 * Migration: Add status column to admin_users table
 */

exports.up = (pgm) => {
  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE admin_users
        ADD COLUMN IF NOT EXISTS status text DEFAULT 'ACTIVE';
    EXCEPTION WHEN duplicate_column THEN NULL;
    END $$;
  `);
};

exports.down = (pgm) => {
  pgm.dropColumn('admin_users', 'status', { ifExists: true });
};
