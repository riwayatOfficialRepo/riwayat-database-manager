/**
 * Corporate RBAC tables — same final schema as admin_permissions and admin_user_roles.
 * Depends on company_user (1779300000000).
 *
 * company_user_roles.role_id mirrors admin_user_roles.role_id (integer, NOT NULL).
 * Add a company roles table + FK in a follow-up migration before assigning roles.
 */
exports.up = (pgm) => {
  // ── company_user_permissions (admin_permissions) ─────────────────
  pgm.createTable(
    'company_user_permissions',
    {
      id: { type: 'serial', primaryKey: true },
      key: { type: 'text', notNull: true },
      label_key: { type: 'text' },
      name: { type: 'text' },
      description: { type: 'text' },
      created_at: {
        type: 'timestamp',
        notNull: true,
        default: pgm.func('now()'),
      },
      updated_at: {
        type: 'timestamp',
        notNull: true,
        default: pgm.func('now()'),
      },
      deleted_at: { type: 'timestamp' },
    },
    { ifNotExists: true },
  );

  pgm.sql(
    'CREATE UNIQUE INDEX IF NOT EXISTS company_user_permissions_key_key ON company_user_permissions (key)',
  );

  // ── company_user_roles (admin_user_roles) ────────────────────────
  pgm.createTable(
    'company_user_roles',
    {
      id: { type: 'serial', primaryKey: true },
      company_user_id: { type: 'uuid', notNull: true },
      role_id: { type: 'integer', notNull: true },
      assigned_at: { type: 'timestamp', default: pgm.func('now()') },
      created_at: {
        type: 'timestamp',
        notNull: true,
        default: pgm.func('now()'),
      },
      updated_at: {
        type: 'timestamp',
        notNull: true,
        default: pgm.func('now()'),
      },
      deleted_at: { type: 'timestamp' },
      status: { type: 'varchar(20)', notNull: true, default: 'ACTIVE' },
    },
    { ifNotExists: true },
  );

  pgm.sql(`
    CREATE UNIQUE INDEX IF NOT EXISTS company_user_roles_company_user_id_role_id_key
      ON company_user_roles (company_user_id, role_id)
  `);

  pgm.sql(`ALTER TABLE company_user_roles ADD COLUMN IF NOT EXISTS deleted_at timestamp`);

  pgm.createIndex('company_user_roles', 'deleted_at', {
    name: 'idx_company_user_roles_deleted_at',
    ifNotExists: true,
  });

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE company_user_roles ADD CONSTRAINT company_user_roles_company_user_id_fkey
        FOREIGN KEY (company_user_id) REFERENCES company_user (id)
        ON UPDATE NO ACTION ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_table OR duplicate_object THEN NULL;
    END $$;
  `);
};

exports.down = (pgm) => {
  pgm.dropTable('company_user_roles', { ifExists: true });
  pgm.dropTable('company_user_permissions', { ifExists: true });
};
