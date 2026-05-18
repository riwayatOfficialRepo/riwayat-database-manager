exports.up = (pgm) => {
  pgm.createTable('dish_media', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    dish_id: { type: 'uuid', notNull: true },
    entity_id: { type: 'uuid' },
    entity_type: { type: 'text' },
    media_type: { type: 'varchar(20)', notNull: true },
    s3_key_original: { type: 'text' },
    s3_key_processed: { type: 'text' },
    s3_key_thumbnail: { type: 'text' },
    status: { type: 'varchar(20)', default: "'under_processing'" },
    category_type: { type: 'text' },
    caption: { type: 'text' },
    media_name: { type: 'varchar(255)' },
    is_published: { type: 'boolean', notNull: true, default: false },
    created_at: { type: 'timestamp', default: pgm.func('now()') },
    updated_at: { type: 'timestamp', default: pgm.func('now()') },
    deleted_at: { type: 'timestamp' },
  }, { ifNotExists: true });

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE dish_media
        ADD CONSTRAINT fk_dish_media_dish
        FOREIGN KEY (dish_id) REFERENCES dishes(id)
        ON UPDATE NO ACTION ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  pgm.sql(`
    CREATE INDEX IF NOT EXISTS idx_dish_media_dish_id
      ON dish_media (dish_id)
      WHERE deleted_at IS NULL;
  `);
};

exports.down = (pgm) => {
  pgm.dropTable('dish_media', { ifExists: true, cascade: true });
};
