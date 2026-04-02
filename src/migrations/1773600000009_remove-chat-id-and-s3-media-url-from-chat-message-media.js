/**
 * Migration: remove chat_id and s3_media_url from chat_message_media
 *
 * Purpose:
 * - Roll back previously added columns that are no longer needed:
 *   - chat_id (and its FK + index)
 *   - s3_media_url
 */
exports.up = (pgm) => {
  // Drop index (if present)
  pgm.dropIndex("chat_message_media", "chat_id", {
    ifExists: true,
    name: "idx_chat_message_media_chat_id",
  });

  // Drop FK constraint (if present)
  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE chat_message_media
        DROP CONSTRAINT IF EXISTS fk_chat_message_media_chat;
    EXCEPTION
      WHEN undefined_object THEN NULL;
    END $$;
  `);

  // Drop columns
  pgm.dropColumn("chat_message_media", "chat_id", { ifExists: true });
  pgm.dropColumn("chat_message_media", "s3_media_url", { ifExists: true });
};

exports.down = (pgm) => {
  // Re-add chat_id (nullable)
  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE chat_message_media
        ADD COLUMN chat_id uuid;
    EXCEPTION
      WHEN duplicate_column THEN NULL;
    END $$;
  `);

  // Re-add FK constraint (if missing)
  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE chat_message_media
        ADD CONSTRAINT fk_chat_message_media_chat
        FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE;
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$;
  `);

  // Re-add index (if missing)
  pgm.createIndex("chat_message_media", "chat_id", {
    name: "idx_chat_message_media_chat_id",
    ifNotExists: true,
  });

  // Re-add s3_media_url (nullable)
  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE chat_message_media
        ADD COLUMN s3_media_url text;
    EXCEPTION
      WHEN duplicate_column THEN NULL;
    END $$;
  `);
};

