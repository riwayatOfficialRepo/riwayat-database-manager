exports.up = (pgm) => {
  pgm.createTable('admin_role_permissions', {
    id: { type: 'serial', primaryKey: true },
    role_id: { type: 'integer', notNull: true },
    permission_id: { type: 'integer', notNull: true },
  }, { ifNotExists: true });

  pgm.sql('CREATE UNIQUE INDEX IF NOT EXISTS admin_role_permissions_role_id_permission_id_key ON admin_role_permissions (role_id, permission_id)');

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE admin_role_permissions ADD CONSTRAINT admin_role_permissions_role_id_fkey
        FOREIGN KEY (role_id) REFERENCES admin_roles (id)
        ON UPDATE NO ACTION ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_table OR duplicate_object THEN NULL;
    END $$;
  `);
};

exports.down = (pgm) => {
  pgm.dropTable('admin_role_permissions', { ifExists: true });
};
