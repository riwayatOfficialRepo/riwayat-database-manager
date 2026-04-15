/**
 * Migration: Add status column to kitchen_chef_stories table
 */

exports.up = (pgm) => {
  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE kitchen_chef_stories
        ADD COLUMN IF NOT EXISTS status varchar(50) DEFAULT 'pending';
    EXCEPTION WHEN duplicate_column THEN NULL;
    END $$;
  `);
};

exports.down = (pgm) => {
  pgm.dropColumn('kitchen_chef_stories', 'status', { ifExists: true });
};
