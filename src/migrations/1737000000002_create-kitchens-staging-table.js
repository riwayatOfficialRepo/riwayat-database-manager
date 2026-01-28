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
  }, { ifNotExists: true });

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE kitchens_staging
        ADD CONSTRAINT kitchens_staging_kitchen_id_fkey
        FOREIGN KEY (kitchen_id) REFERENCES kitchens(id) ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE kitchens_staging ADD CONSTRAINT unique_kitchen_staging_name UNIQUE (name);
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  pgm.sql('CREATE UNIQUE INDEX IF NOT EXISTS kitchens_staging_kitchen_id_idx ON kitchens_staging (kitchen_id)');
};

exports.down = (pgm) => {
  pgm.dropTable('kitchens_staging', { ifExists: true });
};
