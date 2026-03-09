/**
 * Migration: Align admin roles/user-roles tables with kitchen quality standards
 * - admin_roles: add label_key, add status column
 * - admin_user_roles: add NOT NULL constraints, add status, fix FK ON DELETE to CASCADE
 */

exports.up = (pgm) => {
  // === admin_roles ===

  // Add label_key (exists in kitchen_roles)
  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE admin_roles ADD COLUMN label_key text;
    EXCEPTION WHEN duplicate_column THEN NULL;
    END $$;
  `);

  // Add status column (kitchen uses status varchar instead of is_active boolean)
  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE admin_roles ADD COLUMN status varchar(20) NOT NULL DEFAULT 'ACTIVE';
    EXCEPTION WHEN duplicate_column THEN NULL;
    END $$;
  `);

  // === admin_user_roles ===

  // Add status column
  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE admin_user_roles ADD COLUMN status varchar(20) NOT NULL DEFAULT 'ACTIVE';
    EXCEPTION WHEN duplicate_column THEN NULL;
    END $$;
  `);

  // Fix nullability: admin_user_id NOT NULL
  pgm.sql(`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'admin_user_roles' AND column_name = 'admin_user_id' AND is_nullable = 'YES'
      ) THEN
        ALTER TABLE admin_user_roles ALTER COLUMN admin_user_id SET NOT NULL;
      END IF;
    END $$;
  `);

  // Fix nullability: role_id NOT NULL
  pgm.sql(`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'admin_user_roles' AND column_name = 'role_id' AND is_nullable = 'YES'
      ) THEN
        ALTER TABLE admin_user_roles ALTER COLUMN role_id SET NOT NULL;
      END IF;
    END $$;
  `);

  // Fix admin_user_id FK: drop then re-add with CASCADE
  pgm.sql(`
    ALTER TABLE admin_user_roles DROP CONSTRAINT IF EXISTS admin_user_roles_admin_user_id_fkey;
  `);
  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE admin_user_roles ADD CONSTRAINT admin_user_roles_admin_user_id_fkey
        FOREIGN KEY (admin_user_id) REFERENCES admin_users (id)
        ON UPDATE NO ACTION ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  // Fix role_id FK: drop then re-add with CASCADE
  pgm.sql(`
    ALTER TABLE admin_user_roles DROP CONSTRAINT IF EXISTS admin_user_roles_role_id_fkey;
  `);
  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE admin_user_roles ADD CONSTRAINT admin_user_roles_role_id_fkey
        FOREIGN KEY (role_id) REFERENCES admin_roles (id)
        ON UPDATE NO ACTION ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);
};

exports.down = (pgm) => {
  // Revert admin_roles
  pgm.dropColumn('admin_roles', 'label_key', { ifExists: true });
  pgm.dropColumn('admin_roles', 'status', { ifExists: true });

  // Revert admin_user_roles
  pgm.dropColumn('admin_user_roles', 'status', { ifExists: true });

  // Revert FKs back to NO ACTION
  pgm.sql(`ALTER TABLE admin_user_roles DROP CONSTRAINT IF EXISTS admin_user_roles_admin_user_id_fkey;`);
  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE admin_user_roles ADD CONSTRAINT admin_user_roles_admin_user_id_fkey
        FOREIGN KEY (admin_user_id) REFERENCES admin_users (id)
        ON UPDATE NO ACTION ON DELETE NO ACTION;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  pgm.sql(`ALTER TABLE admin_user_roles DROP CONSTRAINT IF EXISTS admin_user_roles_role_id_fkey;`);
  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE admin_user_roles ADD CONSTRAINT admin_user_roles_role_id_fkey
        FOREIGN KEY (role_id) REFERENCES admin_roles (id)
        ON UPDATE NO ACTION ON DELETE NO ACTION;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);
};
