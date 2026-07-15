exports.up = (pgm) => {
  pgm.createTable(
    'feedback_media',
    {
      id: {
        type: 'uuid',
        primaryKey: true,
        default: pgm.func('gen_random_uuid()'),
        notNull: true,
      },
      feedback_id:        { type: 'uuid',         notNull: true },
      entity_id:          { type: 'uuid' },
      entity_type:        { type: 'varchar(50)' },
      media_type:         { type: 'varchar(50)' },
      media_name:         { type: 'varchar(255)' },
      s3_key_original:    { type: 'varchar(500)' },
      s3_key_processed:   { type: 'varchar(500)' },
      s3_key_thumbnail:   { type: 'varchar(500)' },
      status:             { type: 'varchar(50)' },
      is_publish:         { type: 'boolean',      default: false },
      category_type:      { type: 'varchar(50)' },
      caption:            { type: 'text' },
      created_at:         { type: 'timestamptz',  default: pgm.func('now()') },
      updated_at:         { type: 'timestamptz',  default: pgm.func('now()') },
      deleted_at:         { type: 'timestamptz' },
    },
    { ifNotExists: true },
  );

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE feedback_media
        ADD CONSTRAINT fk_feedback_media_feedback_id
        FOREIGN KEY (feedback_id) REFERENCES feedbacks(id);
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  pgm.sql(`
    CREATE OR REPLACE FUNCTION update_feedback_media_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  pgm.sql(`
    CREATE OR REPLACE TRIGGER trg_update_feedback_media
      BEFORE UPDATE ON feedback_media
      FOR EACH ROW
      EXECUTE FUNCTION update_feedback_media_updated_at();
  `);
};

exports.down = (pgm) => {
  pgm.sql(`DROP TRIGGER IF EXISTS trg_update_feedback_media ON feedback_media`);
  pgm.sql(`DROP FUNCTION IF EXISTS update_feedback_media_updated_at()`);
  pgm.dropTable('feedback_media', { ifExists: true, cascade: true });
};
