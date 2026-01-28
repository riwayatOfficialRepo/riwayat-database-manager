exports.up = (pgm) => {
  pgm.sql('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

  pgm.createTable('kitchens', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('uuid_generate_v4()'),
    },
    name: { type: 'text' },
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
      unique: true,
    },
    activated_at: { type: 'timestamp' },
  }, { ifNotExists: true });

  pgm.sql(`
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unique_kitchen_name') THEN
        ALTER TABLE kitchens ADD CONSTRAINT unique_kitchen_name UNIQUE (name);
      END IF;
    END $$;
  `);
};

exports.down = (pgm) => {
  pgm.dropTable('kitchens', { ifExists: true });
};
