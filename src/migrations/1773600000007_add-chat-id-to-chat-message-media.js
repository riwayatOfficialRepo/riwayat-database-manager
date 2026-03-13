/**
 * Migration: add chat_id to chat_message_media
 *
 * Purpose:
 * - Explicitly link each media record to its owning chat
 * - Complement message_id (which may be NULL in "upload first" flows)
 */

exports.up = (pgm) => {
  // Add chat_id column (nullable) with FK to chats(id)
  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE chat_message_media
        ADD COLUMN chat_id uuid;
    EXCEPTION
      WHEN duplicate_column THEN NULL;
    END $$;
  `);

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE chat_message_media
        ADD CONSTRAINT fk_chat_message_media_chat
        FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE;
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$;
  `);

  // Optional index to speed up lookups by chat_id
  pgm.createIndex("chat_message_media", "chat_id", {
    name: "idx_chat_message_media_chat_id",
    ifNotExists: true,
  });
};

exports.down = (pgm) => {
  // Drop index and FK constraint, then column
  pgm.dropIndex("chat_message_media", "chat_id", {
    ifExists: true,
    name: "idx_chat_message_media_chat_id",
  });

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE chat_message_media
        DROP CONSTRAINT IF EXISTS fk_chat_message_media_chat;
    EXCEPTION
      WHEN undefined_object THEN NULL;
    END $$;
  `);

  pgm.dropColumn("chat_message_media", "chat_id", { ifExists: true });
};

