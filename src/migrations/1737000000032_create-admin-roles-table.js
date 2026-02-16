exports.up = (pgm) => {
  pgm.createTable('admin_roles', {
    id: { type: 'serial', primaryKey: true },
    name: { type: 'text', notNull: true },
    description: { type: 'text' },
    created_at: { type: 'timestamp', default: pgm.func('now()') },
    created_by: { type: 'uuid' },
    updated_at: { type: 'timestamp' },
    updated_by: { type: 'uuid' },
    is_active: { type: 'boolean', default: true },
    deleted_at: { type: 'timestamp' },
  }, { ifNotExists: true });

  pgm.sql('CREATE UNIQUE INDEX IF NOT EXISTS admin_roles_name_key ON admin_roles (name)');

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE admin_roles ADD CONSTRAINT admin_roles_created_by_fkey
        FOREIGN KEY (created_by) REFERENCES admin_users (id)
        ON UPDATE NO ACTION ON DELETE SET NULL;
    EXCEPTION WHEN duplicate_table OR duplicate_object THEN NULL;
    END $$;
  `);

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE admin_roles ADD CONSTRAINT admin_roles_updated_by_fkey
        FOREIGN KEY (updated_by) REFERENCES admin_users (id)
        ON UPDATE NO ACTION ON DELETE SET NULL;
    EXCEPTION WHEN duplicate_table OR duplicate_object THEN NULL;
    END $$;
  `);
};

exports.down = (pgm) => {
  pgm.dropTable('admin_roles', { ifExists: true });
};
