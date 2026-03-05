exports.up = (pgm) => {
  pgm.createTable('customer_badge', {
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
    badge_code: {
      type: 'varchar(50)',
      notNull: true,
      references: 'badge_type(badge_code)',
      onDelete: 'CASCADE',
    },
    awarded_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('now()'),
    },
    awarded_by: {
      type: 'varchar(50)',
      notNull: true,
      default: 'system',
    },
    expires_at: {
      type: 'timestamp',
    },
    revoked_at: {
      type: 'timestamp',
    },
    comment: {
      type: 'text',
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

  // Create index for customer badge lookups
  pgm.createIndex('customer_badge', 'customer_id', {
    name: 'idx_customer_badge_customer_id',
    ifNotExists: true,
  });

  pgm.createIndex('customer_badge', 'badge_code', {
    name: 'idx_customer_badge_badge_code',
    ifNotExists: true,
  });
};

exports.down = (pgm) => {
  pgm.dropIndex('customer_badge', 'badge_code', {
    name: 'idx_customer_badge_badge_code',
    ifExists: true,
  });
  pgm.dropIndex('customer_badge', 'customer_id', {
    name: 'idx_customer_badge_customer_id',
    ifExists: true,
  });
  pgm.dropTable('customer_badge', { ifExists: true });
};
