/**
 * Backfill company_roles / company_role_permissions schema when tables existed
 * before constraints and display columns were added (ifNotExists createTable).
 */
exports.up = (pgm) => {
  pgm.sql(`ALTER TABLE company_roles ADD COLUMN IF NOT EXISTS label_key text`);
  pgm.sql(`ALTER TABLE company_roles ADD COLUMN IF NOT EXISTS description text`);
  pgm.sql(`ALTER TABLE company_roles ADD COLUMN IF NOT EXISTS deleted_at timestamp`);
  pgm.sql(`ALTER TABLE company_roles ADD COLUMN IF NOT EXISTS status varchar(20) NOT NULL DEFAULT 'ACTIVE'`);

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE company_roles
        ADD COLUMN created_at timestamp NOT NULL DEFAULT now();
    EXCEPTION WHEN duplicate_column THEN NULL;
    END $$;
  `);

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE company_roles
        ADD COLUMN updated_at timestamp NOT NULL DEFAULT now();
    EXCEPTION WHEN duplicate_column THEN NULL;
    END $$;
  `);

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE company_roles ADD CONSTRAINT company_roles_name_key UNIQUE (name);
    EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL;
    END $$;
  `);

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE company_role_permissions
        ADD CONSTRAINT company_role_permissions_role_id_permission_id_key
        UNIQUE (role_id, permission_id);
    EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL;
    END $$;
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    ALTER TABLE company_role_permissions
      DROP CONSTRAINT IF EXISTS company_role_permissions_role_id_permission_id_key;
  `);
  pgm.sql(`ALTER TABLE company_roles DROP CONSTRAINT IF EXISTS company_roles_name_key`);
};
