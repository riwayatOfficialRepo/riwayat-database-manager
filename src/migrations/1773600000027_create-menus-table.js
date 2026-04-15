/**
 * Migration: Create menus table
 */

exports.up = (pgm) => {
  pgm.createTable(
    'menus',
    {
      id: {
        type: 'uuid',
        primaryKey: true,
        default: pgm.func('gen_random_uuid()'),
        notNull: true,
      },
      kitchen_id: {
        type: 'uuid',
        notNull: true,
      },
      name: {
        type: 'varchar(255)',
        notNull: true,
      },
      label_key: {
        type: 'varchar(100)',
      },
      description: {
        type: 'text',
      },
      status: {
        type: 'varchar(50)',
        notNull: true,
        default: 'ACTIVE',
      },
      display_order: {
        type: 'integer',
        notNull: true,
        default: 0,
      },
      created_at: {
        type: 'timestamp',
        notNull: true,
        default: pgm.func('now()'),
      },
      updated_at: {
        type: 'timestamp',
        notNull: true,
        default: pgm.func('now()'),
      },
      deleted_at: {
        type: 'timestamp',
      },
    },
    { ifNotExists: true },
  );

  pgm.createIndex('menus', 'kitchen_id', {
    name: 'idx_menus_kitchen_id',
    ifNotExists: true,
  });
};

exports.down = (pgm) => {
  pgm.dropIndex('menus', 'kitchen_id', { name: 'idx_menus_kitchen_id', ifExists: true });
  pgm.dropTable('menus', { ifExists: true, cascade: true });
};
