/**
 * Migration: add BaseMediaModel-compatible columns to chat_message_media
 *
 * Aligns chat_message_media schema with riwayat-media-management BaseMediaModel,
 * so MediaService / MediaCreator can work without errors.
 *
 * Common columns added:
 *   entity_id, entity_type, media_name,
 *   s3_key_original, s3_key_processed, s3_key_thumbnail,
 *   status, category_type, caption,
 *   updated_at, deleted_at
 */

exports.up = (pgm) => {
  // entity_id (optional linked entity, e.g. chat_id)
  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE chat_message_media ADD COLUMN entity_id uuid;
    EXCEPTION WHEN duplicate_column THEN NULL;
    END $$;
  `);

  // entity_type (optional discriminator)
  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE chat_message_media ADD COLUMN entity_type text;
    EXCEPTION WHEN duplicate_column THEN NULL;
    END $$;
  `);

  // media_name (human readable label)
  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE chat_message_media ADD COLUMN media_name varchar(255);
    EXCEPTION WHEN duplicate_column THEN NULL;
    END $$;
  `);

  // S3 keys used by MediaCreator / processing workers
  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE chat_message_media ADD COLUMN s3_key_original text;
    EXCEPTION WHEN duplicate_column THEN NULL;
    END $$;
  `);

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE chat_message_media ADD COLUMN s3_key_processed text;
    EXCEPTION WHEN duplicate_column THEN NULL;
    END $$;
  `);

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE chat_message_media ADD COLUMN s3_key_thumbnail text;
    EXCEPTION WHEN duplicate_column THEN NULL;
    END $$;
  `);

  // status column used by BaseMediaModel / MediaService
  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE chat_message_media ADD COLUMN status text NOT NULL DEFAULT 'UNDER_PROCESS';
    EXCEPTION WHEN duplicate_column THEN NULL;
    END $$;
  `);

  // category_type and caption
  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE chat_message_media ADD COLUMN category_type text;
    EXCEPTION WHEN duplicate_column THEN NULL;
    END $$;
  `);

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE chat_message_media ADD COLUMN caption text;
    EXCEPTION WHEN duplicate_column THEN NULL;
    END $$;
  `);

  // Audit columns required by BaseMediaModel
  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE chat_message_media ADD COLUMN updated_at timestamptz NOT NULL DEFAULT now();
    EXCEPTION WHEN duplicate_column THEN NULL;
    END $$;
  `);

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE chat_message_media ADD COLUMN deleted_at timestamptz;
    EXCEPTION WHEN duplicate_column THEN NULL;
    END $$;
  `);
};

exports.down = (pgm) => {
  pgm.dropColumn('chat_message_media', 'entity_id', { ifExists: true });
  pgm.dropColumn('chat_message_media', 'entity_type', { ifExists: true });
  pgm.dropColumn('chat_message_media', 'media_name', { ifExists: true });
  pgm.dropColumn('chat_message_media', 's3_key_original', { ifExists: true });
  pgm.dropColumn('chat_message_media', 's3_key_processed', { ifExists: true });
  pgm.dropColumn('chat_message_media', 's3_key_thumbnail', { ifExists: true });
  pgm.dropColumn('chat_message_media', 'status', { ifExists: true });
  pgm.dropColumn('chat_message_media', 'category_type', { ifExists: true });
  pgm.dropColumn('chat_message_media', 'caption', { ifExists: true });
  pgm.dropColumn('chat_message_media', 'updated_at', { ifExists: true });
  pgm.dropColumn('chat_message_media', 'deleted_at', { ifExists: true });
};

