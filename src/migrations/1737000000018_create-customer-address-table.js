exports.up = (pgm) => {
  pgm.createTable('customer_address', {
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
    label: {
      type: 'varchar(50)',
    },
    type: {
      type: 'varchar(20)',
    },
    line1: {
      type: 'varchar(200)',
      notNull: true,
    },
    line2: {
      type: 'varchar(200)',
    },
    area: {
      type: 'varchar(100)',
    },
    city: {
      type: 'varchar(100)',
      notNull: true,
    },
    province: {
      type: 'varchar(100)',
    },
    postal_code: {
      type: 'varchar(20)',
    },
    country: {
      type: 'varchar(100)',
      notNull: true,
      default: 'Pakistan',
    },
    latitude: {
      type: 'decimal(9,6)',
    },
    longitude: {
      type: 'decimal(9,6)',
    },
    location_source: {
      type: 'varchar(20)',
    },
    instructions: {
      type: 'text',
    },
    contact_person_name: {
      type: 'varchar(100)',
    },
    contact_person_mobile: {
      type: 'varchar(20)',
    },
    is_primary: {
      type: 'boolean',
      notNull: true,
      default: false,
    },
    is_default_delivery: {
      type: 'boolean',
      notNull: true,
      default: false,
    },
    status: {
      type: 'varchar(20)',
      notNull: true,
      default: 'active',
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

  // Create index for customer address lookups
  pgm.createIndex('customer_address', 'customer_id', {
    name: 'idx_customer_address_customer_id',
    ifNotExists: true,
  });
};

exports.down = (pgm) => {
  pgm.dropIndex('customer_address', 'customer_id', {
    name: 'idx_customer_address_customer_id',
    ifExists: true,
  });
  pgm.dropTable('customer_address', { ifExists: true });
};
