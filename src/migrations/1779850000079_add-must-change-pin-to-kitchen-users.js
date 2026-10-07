/**
 * Migration: Add must_change_pin column to kitchen_users table
 *
 * Set true whenever an admin resets a blocked kitchen user's PIN, so the
 * partner-side login flow can force a PIN change on first successful login.
 */

exports.up = (pgm) => {
  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE kitchen_users
        ADD COLUMN IF NOT EXISTS must_change_pin boolean DEFAULT false;
    EXCEPTION WHEN duplicate_column THEN NULL;
    END $$;
  `);
};

exports.down = (pgm) => {
  pgm.dropColumn('kitchen_users', 'must_change_pin', { ifExists: true });
};
