/**
 * Create customer RBAC tables
 *
 * Tables:
 * - customer_permissions
 * - customer_roles
 * - customer_role_permissions
 * - customer_user_roles
 *
 * Notes:
 * - Mirrors kitchen RBAC table shapes (serial PKs, status, timestamps where applicable)
 * - Uses DO blocks to avoid duplicate constraint errors on re-runs
 */
exports.up = (pgm) => {
  // ── customer_roles ─────────────────────────────────────────────
  pgm.createTable(
    "customer_roles",
    {
      id: { type: "serial", primaryKey: true },
      name: { type: "text", notNull: true },
      label_key: { type: "text" },
      description: { type: "text" },
      created_at: { type: "timestamp", default: pgm.func("now()") },
      updated_at: { type: "timestamp" },
      status: { type: "varchar(20)", notNull: true, default: "ACTIVE" },
    },
    { ifNotExists: true },
  );

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE customer_roles ADD CONSTRAINT customer_roles_name_key UNIQUE (name);
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  // ── customer_permissions ───────────────────────────────────────
  pgm.createTable(
    "customer_permissions",
    {
      id: { type: "serial", primaryKey: true },
      key: { type: "text", notNull: true },
      label_key: { type: "text" },
      name: { type: "text" },
      description: { type: "text" },
      created_at: { type: "timestamp", default: pgm.func("now()") },
      updated_at: { type: "timestamp", default: pgm.func("now()") },
      deleted_at: { type: "timestamp" },
    },
    { ifNotExists: true },
  );

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE customer_permissions ADD CONSTRAINT customer_permissions_key_key UNIQUE (key);
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  // ── customer_user_roles ────────────────────────────────────────
  pgm.createTable(
    "customer_user_roles",
    {
      id: { type: "serial", primaryKey: true },
      customer_user_id: { type: "uuid", notNull: true },
      role_id: { type: "integer", notNull: true },
      assigned_at: { type: "timestamp", default: pgm.func("now()") },
      status: { type: "varchar(20)", notNull: true, default: "ACTIVE" },
    },
    { ifNotExists: true },
  );

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE customer_user_roles
        ADD CONSTRAINT customer_user_roles_customer_user_id_fkey
        FOREIGN KEY (customer_user_id) REFERENCES customer(id) ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE customer_user_roles
        ADD CONSTRAINT customer_user_roles_role_id_fkey
        FOREIGN KEY (role_id) REFERENCES customer_roles(id) ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE customer_user_roles
        ADD CONSTRAINT customer_user_roles_user_role_key UNIQUE (customer_user_id, role_id);
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  // ── customer_role_permissions ──────────────────────────────────
  pgm.createTable(
    "customer_role_permissions",
    {
      id: { type: "serial", primaryKey: true },
      role_id: { type: "integer", notNull: true },
      permission_id: { type: "integer", notNull: true },
    },
    { ifNotExists: true },
  );

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE customer_role_permissions
        ADD CONSTRAINT customer_role_permissions_role_id_fkey
        FOREIGN KEY (role_id) REFERENCES customer_roles(id) ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE customer_role_permissions
        ADD CONSTRAINT customer_role_permissions_permission_id_fkey
        FOREIGN KEY (permission_id) REFERENCES customer_permissions(id) ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE customer_role_permissions
        ADD CONSTRAINT customer_role_permissions_role_id_permission_id_key UNIQUE (role_id, permission_id);
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);
};

exports.down = (pgm) => {
  pgm.dropTable("customer_role_permissions", { ifExists: true });
  pgm.dropTable("customer_user_roles", { ifExists: true });
  pgm.dropTable("customer_permissions", { ifExists: true });
  pgm.dropTable("customer_roles", { ifExists: true });
};

