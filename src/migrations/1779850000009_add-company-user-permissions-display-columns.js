/**
 * Backfill company_user_permissions columns when the table was created before
 * label_key / name / description / deleted_at were added (createTable ifNotExists
 * skips schema updates on existing tables).
 */
exports.up = (pgm) => {
  pgm.sql(`ALTER TABLE company_user_permissions ADD COLUMN IF NOT EXISTS label_key text`);
  pgm.sql(`ALTER TABLE company_user_permissions ADD COLUMN IF NOT EXISTS name text`);
  pgm.sql(`ALTER TABLE company_user_permissions ADD COLUMN IF NOT EXISTS description text`);
  pgm.sql(`ALTER TABLE company_user_permissions ADD COLUMN IF NOT EXISTS deleted_at timestamp`);

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE company_user_permissions
        ADD COLUMN created_at timestamp NOT NULL DEFAULT now();
    EXCEPTION WHEN duplicate_column THEN NULL;
    END $$;
  `);

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE company_user_permissions
        ADD COLUMN updated_at timestamp NOT NULL DEFAULT now();
    EXCEPTION WHEN duplicate_column THEN NULL;
    END $$;
  `);
};

exports.down = (pgm) => {
  pgm.sql(`ALTER TABLE company_user_permissions DROP COLUMN IF EXISTS label_key`);
  pgm.sql(`ALTER TABLE company_user_permissions DROP COLUMN IF EXISTS name`);
  pgm.sql(`ALTER TABLE company_user_permissions DROP COLUMN IF EXISTS description`);
  pgm.sql(`ALTER TABLE company_user_permissions DROP COLUMN IF EXISTS deleted_at`);
};
