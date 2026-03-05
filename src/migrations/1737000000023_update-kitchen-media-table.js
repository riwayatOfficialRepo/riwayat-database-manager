exports.up = (pgm) => {
  // Remove old columns
  pgm.dropColumn('kitchen_media', 's3_key_banner', { ifExists: true });
  pgm.dropColumn('kitchen_media', 's3_key_standard', { ifExists: true });
  pgm.dropColumn('kitchen_media', 's3_key_logo', { ifExists: true });

  // Add new columns if they don't already exist
  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE kitchen_media ADD COLUMN entity_id uuid;
    EXCEPTION WHEN duplicate_column THEN NULL;
    END $$;
  `);

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE kitchen_media ADD COLUMN entity_type text;
    EXCEPTION WHEN duplicate_column THEN NULL;
    END $$;
  `);

  // Change id default from uuid_generate_v4() to gen_random_uuid()
  pgm.alterColumn('kitchen_media', 'id', {
    default: pgm.func('gen_random_uuid()'),
  });

  // Rename FK constraint
  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE kitchen_media
        DROP CONSTRAINT IF EXISTS fk_kitchen;
    EXCEPTION WHEN undefined_object THEN NULL;
    END $$;
  `);

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE kitchen_media
        ADD CONSTRAINT fk_kitchen_media_kitchen
        FOREIGN KEY (kitchen_id) REFERENCES kitchens(id);
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);
};

exports.down = (pgm) => {
  // Re-add removed columns
  pgm.addColumn('kitchen_media', {
    s3_key_banner: { type: 'text' },
    s3_key_standard: { type: 'varchar(255)' },
    s3_key_logo: { type: 'varchar(255)' },
  });

  // Remove added columns
  pgm.dropColumn('kitchen_media', 'entity_id', { ifExists: true });
  pgm.dropColumn('kitchen_media', 'entity_type', { ifExists: true });

  // Revert id default
  pgm.alterColumn('kitchen_media', 'id', {
    default: pgm.func('uuid_generate_v4()'),
  });

  // Revert FK constraint
  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE kitchen_media
        DROP CONSTRAINT IF EXISTS fk_kitchen_media_kitchen;
    EXCEPTION WHEN undefined_object THEN NULL;
    END $$;
  `);

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE kitchen_media
        ADD CONSTRAINT fk_kitchen
        FOREIGN KEY (kitchen_id) REFERENCES kitchens(id);
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);
};
