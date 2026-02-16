exports.up = (pgm) => {
  pgm.createTable('admin_user_roles', {
    id: { type: 'serial', primaryKey: true },
    admin_user_id: { type: 'uuid' },
    role_id: { type: 'integer' },
    assigned_at: { type: 'timestamp', default: pgm.func('now()') },
  }, { ifNotExists: true });

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE admin_user_roles ADD CONSTRAINT admin_user_roles_admin_user_id_role_id_key UNIQUE (admin_user_id, role_id);
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE admin_user_roles ADD CONSTRAINT admin_user_roles_admin_user_id_fkey
        FOREIGN KEY (admin_user_id) REFERENCES admin_users (id)
        ON UPDATE NO ACTION ON DELETE NO ACTION;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE admin_user_roles ADD CONSTRAINT admin_user_roles_role_id_fkey
        FOREIGN KEY (role_id) REFERENCES admin_roles (id)
        ON UPDATE NO ACTION ON DELETE NO ACTION;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);
};

exports.down = (pgm) => {
  pgm.dropTable('admin_user_roles', { ifExists: true });
};
