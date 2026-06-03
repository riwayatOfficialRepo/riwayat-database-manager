/**
 * Corporate RBAC roles for company_user accounts.
 *
 * Completes the company_user_permissions / company_user_roles schema so
 * riwayat-auth-manager can evaluate hasPermission(userId, "CORPORATE", ...).
 */
exports.up = (pgm) => {
  pgm.sql(`
    ALTER TABLE refresh_tokens DROP CONSTRAINT IF EXISTS chk_refresh_tokens_user_type;
  `);
  pgm.sql(`
    ALTER TABLE refresh_tokens ADD CONSTRAINT chk_refresh_tokens_user_type
    CHECK (user_type IN ('PARTNER', 'ADMIN', 'CUSTOMER', 'DELIVERY_DRIVER', 'RIDER', 'CORPORATE'));
  `);
  pgm.sql(`
    COMMENT ON COLUMN refresh_tokens.user_type IS
      'JWT auth user type: PARTNER, ADMIN, CUSTOMER, DELIVERY_DRIVER, RIDER, CORPORATE';
  `);

  pgm.createTable(
    'company_roles',
    {
      id: { type: 'serial', primaryKey: true },
      name: { type: 'text', notNull: true },
      label_key: { type: 'text' },
      description: { type: 'text' },
      created_at: { type: 'timestamp', notNull: true, default: pgm.func('now()') },
      updated_at: { type: 'timestamp', notNull: true, default: pgm.func('now()') },
      deleted_at: { type: 'timestamp' },
      status: { type: 'varchar(20)', notNull: true, default: 'ACTIVE' },
    },
    { ifNotExists: true },
  );

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE company_roles ADD CONSTRAINT company_roles_name_key UNIQUE (name);
    EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL;
    END $$;
  `);

  pgm.createTable(
    'company_role_permissions',
    {
      id: { type: 'serial', primaryKey: true },
      role_id: { type: 'integer', notNull: true },
      permission_id: { type: 'integer', notNull: true },
      created_at: { type: 'timestamp', notNull: true, default: pgm.func('now()') },
      updated_at: { type: 'timestamp', notNull: true, default: pgm.func('now()') },
    },
    { ifNotExists: true },
  );

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE company_role_permissions
        ADD CONSTRAINT company_role_permissions_role_id_fkey
        FOREIGN KEY (role_id) REFERENCES company_roles(id) ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL;
    END $$;
  `);

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE company_role_permissions
        ADD CONSTRAINT company_role_permissions_permission_id_fkey
        FOREIGN KEY (permission_id) REFERENCES company_user_permissions(id) ON DELETE CASCADE;
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

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE company_user_roles
        ADD CONSTRAINT company_user_roles_role_id_fkey
        FOREIGN KEY (role_id) REFERENCES company_roles(id) ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object OR duplicate_table OR foreign_key_violation THEN NULL;
    END $$;
  `);

  pgm.createIndex('company_user_roles', 'company_user_id', {
    name: 'idx_company_user_roles_company_user_id',
    ifNotExists: true,
  });
  pgm.createIndex('company_role_permissions', 'role_id', {
    name: 'idx_company_role_permissions_role_id',
    ifNotExists: true,
  });
};

exports.down = (pgm) => {
  pgm.sql('ALTER TABLE company_user_roles DROP CONSTRAINT IF EXISTS company_user_roles_role_id_fkey');
  pgm.dropTable('company_role_permissions', { ifExists: true });
  pgm.dropTable('company_roles', { ifExists: true });
  pgm.sql(`
    ALTER TABLE refresh_tokens DROP CONSTRAINT IF EXISTS chk_refresh_tokens_user_type;
  `);
  pgm.sql(`
    ALTER TABLE refresh_tokens ADD CONSTRAINT chk_refresh_tokens_user_type
    CHECK (user_type IN ('PARTNER', 'ADMIN', 'CUSTOMER', 'DELIVERY_DRIVER', 'RIDER'));
  `);
  pgm.sql(`
    COMMENT ON COLUMN refresh_tokens.user_type IS
      'JWT auth user type: PARTNER, ADMIN, CUSTOMER, DELIVERY_DRIVER, RIDER';
  `);
};
