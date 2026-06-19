/**
 * Repair missing rider RBAC junction tables when 1775500000000 was recorded
 * but rider_user_roles / rider_role_permissions were not created.
 */

exports.up = (pgm) => {
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
    EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL;
    END $$;
  `);

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE rider_user_roles
        ADD CONSTRAINT rider_user_roles_role_id_fkey
        FOREIGN KEY (role_id) REFERENCES rider_roles(id) ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL;
    END $$;
  `);

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE rider_user_roles
        ADD CONSTRAINT rider_user_roles_rider_id_role_id_key UNIQUE (rider_id, role_id);
    EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL;
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
    EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL;
    END $$;
  `);

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE rider_role_permissions
        ADD CONSTRAINT rider_role_permissions_permission_id_fkey
        FOREIGN KEY (permission_id) REFERENCES rider_permissions(id) ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL;
    END $$;
  `);

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE rider_role_permissions
        ADD CONSTRAINT rider_role_permissions_role_id_permission_id_key UNIQUE (role_id, permission_id);
    EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL;
    END $$;
  `);

  pgm.createIndex("rider_user_roles", "rider_id", {
    name: "idx_rider_user_roles_rider_id",
    ifNotExists: true,
  });

  // Ensure default Rider role exists.
  pgm.sql(`
    INSERT INTO rider_roles (name, label_key, description, status)
    VALUES ('Rider', 'role.rider', 'Default rider app role', 'ACTIVE')
    ON CONFLICT (name) DO UPDATE SET
      label_key = EXCLUDED.label_key,
      description = EXCLUDED.description,
      status = EXCLUDED.status;
  `);

  // Backfill role ↔ permission grants for all rider.* permissions.
  pgm.sql(`
    INSERT INTO rider_role_permissions (role_id, permission_id)
    SELECT r.id, p.id
    FROM rider_roles r
    INNER JOIN rider_permissions p ON p.key LIKE 'rider.%'
    WHERE r.name = 'Rider' AND r.status = 'ACTIVE'
    ON CONFLICT (role_id, permission_id) DO NOTHING;
  `);

  // Backfill rider ↔ role assignments for existing riders.
  pgm.sql(`
    INSERT INTO rider_user_roles (rider_id, role_id, status)
    SELECT rd.rider_id, r.id, 'ACTIVE'
    FROM riders rd
    CROSS JOIN rider_roles r
    WHERE r.name = 'Rider' AND r.status = 'ACTIVE'
      AND NOT EXISTS (
        SELECT 1 FROM rider_user_roles ur
        WHERE ur.rider_id = rd.rider_id AND ur.role_id = r.id
      );
  `);
};

exports.down = (pgm) => {
  pgm.dropTable("rider_role_permissions", { ifExists: true });
  pgm.dropTable("rider_user_roles", { ifExists: true });
};
