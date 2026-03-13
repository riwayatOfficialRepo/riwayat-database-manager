/**
 * Migration: Refactor chat_message_media to align with BaseMediaModel
 *
 * The original table was created with a different schema (chat_media_type enum,
 * mime_type, file_url, metadata jsonb, etc.) that doesn't match BaseMediaModel.
 *
 * This migration:
 *   1. Drops columns not used by BaseMediaModel (mime_type, file_url, thumbnail_url,
 *      file_name, file_size, duration, width, height, metadata)
 *   2. Changes media_type from chat_media_type enum to text
 *   3. Ensures BaseMediaModel-compatible columns exist (added by previous migration)
 */

exports.up = (pgm) => {
  // 1. Drop columns not used by BaseMediaModel
  pgm.dropColumn('chat_message_media', 'mime_type', { ifExists: true });
  pgm.dropColumn('chat_message_media', 'file_url', { ifExists: true });
  pgm.dropColumn('chat_message_media', 'thumbnail_url', { ifExists: true });
  pgm.dropColumn('chat_message_media', 'file_name', { ifExists: true });
  pgm.dropColumn('chat_message_media', 'file_size', { ifExists: true });
  pgm.dropColumn('chat_message_media', 'duration', { ifExists: true });
  pgm.dropColumn('chat_message_media', 'width', { ifExists: true });
  pgm.dropColumn('chat_message_media', 'height', { ifExists: true });
  pgm.dropColumn('chat_message_media', 'metadata', { ifExists: true });

  // 2. Change media_type from enum to text
  // First add a temporary text column, copy data, drop old column, rename
  pgm.sql(`
    DO $$ BEGIN
      -- Add temp column
      ALTER TABLE chat_message_media ADD COLUMN media_type_new text;
      -- Copy existing values (cast enum to text)
      UPDATE chat_message_media SET media_type_new = media_type::text;
      -- Drop old enum column
      ALTER TABLE chat_message_media DROP COLUMN media_type;
      -- Rename new column
      ALTER TABLE chat_message_media RENAME COLUMN media_type_new TO media_type;
    EXCEPTION WHEN undefined_column THEN
      -- media_type might already be text or not exist
      NULL;
    END $$;
  `);

  // Drop the enum type if no longer used
  pgm.sql(`DROP TYPE IF EXISTS chat_media_type;`);
};

exports.down = (pgm) => {
  // Re-create the enum type
  pgm.sql(`
    DO $$ BEGIN
      CREATE TYPE chat_media_type AS ENUM ('image', 'audio', 'file');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  // Convert media_type back to enum
  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE chat_message_media ADD COLUMN media_type_old chat_media_type;
      UPDATE chat_message_media 
        SET media_type_old = CASE 
          WHEN media_type IN ('image', 'audio', 'file') THEN media_type::chat_media_type
          ELSE 'file'::chat_media_type
        END;
      ALTER TABLE chat_message_media DROP COLUMN media_type;
      ALTER TABLE chat_message_media RENAME COLUMN media_type_old TO media_type;
      ALTER TABLE chat_message_media ALTER COLUMN media_type SET NOT NULL;
    EXCEPTION WHEN undefined_column THEN NULL;
    END $$;
  `);

  // Re-add dropped columns
  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE chat_message_media ADD COLUMN mime_type varchar(100) NOT NULL DEFAULT 'application/octet-stream';
    EXCEPTION WHEN duplicate_column THEN NULL;
    END $$;
  `);

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE chat_message_media ADD COLUMN file_url varchar(1000) NOT NULL DEFAULT '';
    EXCEPTION WHEN duplicate_column THEN NULL;
    END $$;
  `);

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE chat_message_media ADD COLUMN thumbnail_url varchar(1000);
    EXCEPTION WHEN duplicate_column THEN NULL;
    END $$;
  `);

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE chat_message_media ADD COLUMN file_name varchar(255);
    EXCEPTION WHEN duplicate_column THEN NULL;
    END $$;
  `);

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE chat_message_media ADD COLUMN file_size bigint;
    EXCEPTION WHEN duplicate_column THEN NULL;
    END $$;
  `);

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE chat_message_media ADD COLUMN duration integer;
    EXCEPTION WHEN duplicate_column THEN NULL;
    END $$;
  `);

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE chat_message_media ADD COLUMN width integer;
    EXCEPTION WHEN duplicate_column THEN NULL;
    END $$;
  `);

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE chat_message_media ADD COLUMN height integer;
    EXCEPTION WHEN duplicate_column THEN NULL;
    END $$;
  `);

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE chat_message_media ADD COLUMN metadata jsonb DEFAULT '{}';
    EXCEPTION WHEN duplicate_column THEN NULL;
    END $$;
  `);
};
