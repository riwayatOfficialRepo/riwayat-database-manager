/**
 * Migration: add s3_media_url to chat_message_media
 *
 * Purpose:
 * - Persist the generated presigned/upload URL (or final public URL) alongside the media record
 * - Expose as `s3MediaUrl` at the application layer when needed
 */
exports.up = (pgm) => {
  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE chat_message_media
        ADD COLUMN s3_media_url text;
    EXCEPTION
      WHEN duplicate_column THEN NULL;
    END $$;
  `);
};

exports.down = (pgm) => {
  pgm.dropColumn("chat_message_media", "s3_media_url", { ifExists: true });
};

