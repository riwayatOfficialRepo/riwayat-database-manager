exports.up = (pgm) => {
  pgm.createTable('kitchen_user_roles', {
    id: { type: 'serial', primaryKey: true },
    kitchen_user_id: { type: 'uuid', notNull: true },
    role_id: { type: 'integer', notNull: true },
    assigned_at: { type: 'timestamp', default: pgm.func('now()') },
    status: { type: 'varchar(20)', notNull: true, default: 'ACTIVE' },
  }, { ifNotExists: true });

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE kitchen_user_roles
        ADD CONSTRAINT kitchen_user_roles_kitchen_user_id_fkey
        FOREIGN KEY (kitchen_user_id) REFERENCES kitchen_users(id) ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE kitchen_user_roles
        ADD CONSTRAINT kitchen_user_roles_role_id_fkey
        FOREIGN KEY (role_id) REFERENCES kitchen_roles(id) ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE kitchen_user_roles ADD CONSTRAINT kitchen_user_roles_user_role_key UNIQUE (kitchen_user_id, role_id);
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);
};

exports.down = (pgm) => {
  pgm.dropTable('kitchen_user_roles', { ifExists: true });
};
