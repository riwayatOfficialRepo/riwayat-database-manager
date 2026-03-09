exports.up = (pgm) => {
  pgm.createTable('admin_permissions', {
    id: { type: 'serial', primaryKey: true },
    key: { type: 'text', notNull: true },
    label_key: { type: 'text' },
    name: { type: 'text' },
    description: { type: 'text' },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('now()') },
    deleted_at: { type: 'timestamp' },
  }, { ifNotExists: true });

  pgm.sql('CREATE UNIQUE INDEX IF NOT EXISTS admin_permissions_key_key ON admin_permissions (key)');

  // Add FK from admin_role_permissions.permission_id -> admin_permissions.id
  // Done here because admin_permissions (053) runs after admin_role_permissions (052)
  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE admin_role_permissions ADD CONSTRAINT admin_role_permissions_permission_id_fkey
        FOREIGN KEY (permission_id) REFERENCES admin_permissions (id)
        ON UPDATE NO ACTION ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_table OR duplicate_object THEN NULL;
    END $$;
  `);
};

exports.down = (pgm) => {
  pgm.dropTable('admin_permissions', { ifExists: true });
};
