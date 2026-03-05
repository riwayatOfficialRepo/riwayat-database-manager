exports.up = (pgm) => {
  pgm.createTable('kitchen_media', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    kitchen_id: { type: 'uuid', notNull: true },
    entity_id: { type: 'uuid' },
    entity_type: { type: 'text' },
    media_type: { type: 'varchar(20)', notNull: true },
    s3_key_original: { type: 'text' },
    s3_key_processed: { type: 'text' },
    s3_key_thumbnail: { type: 'text' },
    status: { type: 'varchar(20)', default: 'under_processing' },
    category_type: { type: 'text' },
    caption: { type: 'text' },
    media_name: { type: 'varchar(255)' },
    created_at: { type: 'timestamp', default: pgm.func('now()') },
    updated_at: { type: 'timestamp', default: pgm.func('now()') },
    deleted_at: { type: 'timestamp' },
  }, { ifNotExists: true });

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
  pgm.dropTable('kitchen_media', { ifExists: true });
};
