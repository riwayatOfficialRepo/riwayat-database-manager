exports.up = (pgm) => {
  pgm.createTable('kitchens_staging', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('uuid_generate_v4()'),
    },
    kitchen_id: {
      type: 'uuid',
      notNull: true,
      references: 'kitchens(id)',
      onDelete: 'CASCADE',
    },
    name: { type: 'text', notNull: true },
    tagline: { type: 'text' },
    bio: { type: 'text' },
    is_logo_available: { type: 'boolean', default: false },
    status: { type: 'text', default: 'pending' },
    created_at: { type: 'timestamp', default: pgm.func('now()') },
    updated_at: { type: 'timestamp', default: pgm.func('now()') },
    deleted_at: { type: 'timestamp' },
    kitchen_business_ref: {
      type: 'varchar(20)',
      notNull: true,
      default: 'TEMP-REF',
    },
    activated_at: { type: 'timestamp' },
  });

  pgm.addConstraint('kitchens_staging', 'unique_kitchen_staging_name', {
    unique: ['name'],
  });

  pgm.createIndex('kitchens_staging', 'kitchen_id', { unique: true });
};

exports.down = (pgm) => {
  pgm.dropTable('kitchens_staging');
};
