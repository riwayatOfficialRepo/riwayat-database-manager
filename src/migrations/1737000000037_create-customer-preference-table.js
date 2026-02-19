exports.up = (pgm) => {
  pgm.createTable('customer_preference', {
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
    pref_key: {
      type: 'varchar(50)',
      notNull: true,
    },
    pref_value: {
      type: 'text',
      notNull: true,
    },
    source: {
      type: 'varchar(20)',
      notNull: true,
      default: 'user',
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
  }, { ifNotExists: true });

  // Create unique index to avoid duplicate active preferences for same key/value
  pgm.createIndex('customer_preference', ['customer_id', 'pref_key', 'pref_value'], {
    name: 'ux_customer_preference_unique',
    unique: true,
    ifNotExists: true,
  });
};

exports.down = (pgm) => {
  pgm.dropIndex('customer_preference', ['customer_id', 'pref_key', 'pref_value'], {
    name: 'ux_customer_preference_unique',
    ifExists: true,
  });
  pgm.dropTable('customer_preference', { ifExists: true });
};
