exports.up = (pgm) => {
  pgm.createTable('auth_identity', {
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
    provider: {
      type: 'varchar(20)',
      notNull: true,
    },
    provider_user_id: {
      type: 'varchar(200)',
      notNull: true,
    },
    email: {
      type: 'varchar(150)',
    },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('now()'),
    },
  }, { ifNotExists: true });

  // Create index for faster lookups by provider and provider_user_id
  pgm.createIndex('auth_identity', ['provider', 'provider_user_id'], {
    name: 'idx_auth_identity_provider_lookup',
    unique: true,
    ifNotExists: true,
  });

  // Create index for customer_id lookups
  pgm.createIndex('auth_identity', 'customer_id', {
    name: 'idx_auth_identity_customer_id',
    ifNotExists: true,
  });
};

exports.down = (pgm) => {
  pgm.dropIndex('auth_identity', 'customer_id', {
    name: 'idx_auth_identity_customer_id',
    ifExists: true,
  });
  pgm.dropIndex('auth_identity', ['provider', 'provider_user_id'], {
    name: 'idx_auth_identity_provider_lookup',
    ifExists: true,
  });
  pgm.dropTable('auth_identity', { ifExists: true });
};
