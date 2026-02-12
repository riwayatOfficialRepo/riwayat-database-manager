exports.up = (pgm) => {
  pgm.createTable('customer', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    customer_small_id: {
      type: 'varchar(20)',
      notNull: true,
      unique: true,
    },
    name: {
      type: 'varchar(100)',
      notNull: true,
    },
    email: {
      type: 'varchar(150)',
    },
    is_email_verified: {
      type: 'boolean',
      notNull: true,
      default: false,
    },
    mobile: {
      type: 'varchar(20)',
    },
    is_mobile_verified: {
      type: 'boolean',
      notNull: true,
      default: false,
    },
    type: {
      type: 'varchar(20)',
      notNull: true,
      default: 'basic',
    },
    status: {
      type: 'varchar(20)',
      notNull: true,
      default: 'active',
    },
    gender: {
      type: 'varchar(20)',
    },
    dob: {
      type: 'date',
    },
    last_login_at: {
      type: 'timestamp',
    },
    last_order_at: {
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
  pgm.dropTable('customer', { ifExists: true, cascade: true });
};
