exports.up = (pgm) => {
  pgm.createTable('kitchen_roles', {
    id: { type: 'serial', primaryKey: true },
    name: { type: 'text', notNull: true, unique: true },
    label_key: { type: 'text' },
    description: { type: 'text' },
    created_at: { type: 'timestamp', default: pgm.func('now()') },
    updated_at: { type: 'timestamp' },
    status: { type: 'varchar(20)', notNull: true, default: 'ACTIVE' },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('kitchen_roles');
};
