exports.up = (pgm) => {
  pgm.createTable('kitchen_media', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('uuid_generate_v4()'),
    },
    kitchen_id: { type: 'uuid', notNull: true },
    media_type: { type: 'varchar(20)', notNull: true },
    s3_key_original: { type: 'text' },
    s3_key_processed: { type: 'text' },
    s3_key_banner: { type: 'text' },
    status: { type: 'varchar(20)', default: 'under_processing' },
    created_at: { type: 'timestamp', default: pgm.func('now()') },
    updated_at: { type: 'timestamp', default: pgm.func('now()') },
    deleted_at: { type: 'timestamp' },
    category_type: { type: 'text' },
    s3_key_thumbnail: { type: 'text' },
    s3_key_standard: { type: 'varchar(255)' },
    s3_key_logo: { type: 'varchar(255)' },
    caption: { type: 'text' },
    media_name: { type: 'varchar(255)' },
  }, { ifNotExists: true });

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE kitchen_media
        ADD CONSTRAINT fk_kitchen
        FOREIGN KEY (kitchen_id) REFERENCES kitchens(id);
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);
};

exports.down = (pgm) => {
  pgm.dropTable('kitchen_media', { ifExists: true });
};
