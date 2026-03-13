/**
 * Migration: make chat_message_media.message_id nullable
 *
 * This enables the "upload first, link later" flow for chat media:
 * - Media can be created with message_id = NULL
 * - Later, when a message is persisted with media_id, the worker links them
 */

exports.up = (pgm) => {
  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE chat_message_media
        ALTER COLUMN message_id DROP NOT NULL;
    EXCEPTION
      WHEN undefined_column THEN NULL;
    END $$;
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE chat_message_media
        ALTER COLUMN message_id SET NOT NULL;
    EXCEPTION
      WHEN undefined_column THEN NULL;
    END $$;
  `);
};

