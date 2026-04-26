/**
 * Rider RBAC (mirrors customer_roles / customer_permissions pattern).
 * Links riders.rider_id to roles and permissions for riwayat-auth-manager hasPermission(RIDER).
 */
exports.up = (pgm) => {
  pgm.createTable(
    "rider_roles",
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
      ALTER TABLE rider_roles ADD CONSTRAINT rider_roles_name_key UNIQUE (name);
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  pgm.createTable(
    "rider_permissions",
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
      ALTER TABLE rider_permissions ADD CONSTRAINT rider_permissions_key_key UNIQUE (key);
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  pgm.createTable(
    "rider_user_roles",
    {
      id: { type: "serial", primaryKey: true },
      rider_id: { type: "uuid", notNull: true },
      role_id: { type: "integer", notNull: true },
      assigned_at: { type: "timestamp", default: pgm.func("now()") },
      status: { type: "varchar(20)", notNull: true, default: "ACTIVE" },
    },
    { ifNotExists: true },
  );

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE rider_user_roles
        ADD CONSTRAINT rider_user_roles_rider_fkey
        FOREIGN KEY (rider_id) REFERENCES riders(rider_id) ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE rider_user_roles
        ADD CONSTRAINT rider_user_roles_role_id_fkey
        FOREIGN KEY (role_id) REFERENCES rider_roles(id) ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE rider_user_roles
        ADD CONSTRAINT rider_user_roles_rider_id_role_id_key UNIQUE (rider_id, role_id);
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  pgm.createTable(
    "rider_role_permissions",
    {
      id: { type: "serial", primaryKey: true },
      role_id: { type: "integer", notNull: true },
      permission_id: { type: "integer", notNull: true },
    },
    { ifNotExists: true },
  );

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE rider_role_permissions
        ADD CONSTRAINT rider_role_permissions_role_id_fkey
        FOREIGN KEY (role_id) REFERENCES rider_roles(id) ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE rider_role_permissions
        ADD CONSTRAINT rider_role_permissions_permission_id_fkey
        FOREIGN KEY (permission_id) REFERENCES rider_permissions(id) ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE rider_role_permissions
        ADD CONSTRAINT rider_role_permissions_role_id_permission_id_key UNIQUE (role_id, permission_id);
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  pgm.createIndex("rider_user_roles", "rider_id", {
    name: "idx_rider_user_roles_rider_id",
    ifNotExists: true,
  });
};

exports.down = (pgm) => {
  pgm.dropTable("rider_role_permissions", { ifExists: true });
  pgm.dropTable("rider_user_roles", { ifExists: true });
  pgm.dropTable("rider_permissions", { ifExists: true });
  pgm.dropTable("rider_roles", { ifExists: true });
};
