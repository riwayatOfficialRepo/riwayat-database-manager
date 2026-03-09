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
};

exports.down = (pgm) => {
  pgm.dropTable('admin_permissions', { ifExists: true });
};
