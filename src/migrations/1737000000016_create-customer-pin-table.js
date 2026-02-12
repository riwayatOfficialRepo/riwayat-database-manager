exports.up = (pgm) => {
  pgm.createTable('customer_pin', {
    customer_id: {
      type: 'uuid',
      primaryKey: true,
      references: 'customer(id)',
      onDelete: 'CASCADE',
    },
    pin_hash: {
      type: 'text',
      notNull: true,
    },
    pin_set_at: {
      type: 'timestamp',
    },
    pin_failed_attempts: {
      type: 'int',
      notNull: true,
      default: 0,
    },
    pin_locked_until: {
      type: 'timestamp',
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
};

exports.down = (pgm) => {
  pgm.dropTable('customer_pin', { ifExists: true });
};
