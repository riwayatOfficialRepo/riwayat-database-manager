exports.up = (pgm) => {
  pgm.createTable('customer_favorite', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    customer_id: {
      type: 'uuid',
      notNull: true,
      references: 'customer(id)',
      onDelete: 'CASCADE',
    },
    favorite_type: {
      type: 'varchar(20)',
      notNull: true,
    },
    target_id: {
      type: 'uuid',
      notNull: true,
    },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('now()'),
    },
    removed_at: {
      type: 'timestamp',
    },
    source: {
      type: 'varchar(20)',
      notNull: true,
      default: 'user',
    },
  }, { ifNotExists: true });

  // Create index for faster lookups
  pgm.createIndex('customer_favorite', ['customer_id', 'favorite_type', 'target_id'], {
    name: 'idx_customer_favorite_lookup',
    ifNotExists: true,
  });
};

exports.down = (pgm) => {
  pgm.dropIndex('customer_favorite', ['customer_id', 'favorite_type', 'target_id'], {
    name: 'idx_customer_favorite_lookup',
    ifExists: true,
  });
  pgm.dropTable('customer_favorite', { ifExists: true });
};
