exports.up = (pgm) => {
  pgm.createTable('kitchen_permissions', {
    id: { type: 'serial', primaryKey: true },
    key: { type: 'text', notNull: true, unique: true },
    label_key: { type: 'text' },
    name: { type: 'text' },
    description: { type: 'text' },
    created_at: { type: 'timestamp', default: pgm.func('now()') },
    updated_at: { type: 'timestamp', default: pgm.func('now()') },
    deleted_at: { type: 'timestamp' },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('kitchen_permissions');
};
