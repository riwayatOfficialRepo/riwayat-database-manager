exports.up = (pgm) => {
  pgm.createTable('kitchen_role_permissions', {
    id: { type: 'serial', primaryKey: true },
    role_id: { type: 'integer', notNull: true },
    permission_id: { type: 'integer', notNull: true },
  }, { ifNotExists: true });

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE kitchen_role_permissions
        ADD CONSTRAINT kitchen_role_permissions_role_id_fkey
        FOREIGN KEY (role_id) REFERENCES kitchen_roles(id) ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE kitchen_role_permissions
        ADD CONSTRAINT kitchen_role_permissions_permission_id_fkey
        FOREIGN KEY (permission_id) REFERENCES kitchen_permissions(id) ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE kitchen_role_permissions ADD CONSTRAINT kitchen_role_permissions_role_id_permission_id_key UNIQUE (role_id, permission_id);
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);
};

exports.down = (pgm) => {
  pgm.dropTable('kitchen_role_permissions', { ifExists: true });
};
