/**
 * Migration: Create chat_message_media table
 * Stores media attachments for messages
 */

exports.up = (pgm) => {
  pgm.createType('chat_media_type', [
    'image',
    'audio',
    'file'
  ]);

  pgm.createTable('chat_message_media', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()')
    },
    message_id: {
      type: 'uuid',
      notNull: true,
      references: 'chat_messages(id)',
      onDelete: 'CASCADE'
    },
    // Media information
    media_type: {
      type: 'chat_media_type',
      notNull: true
    },
    mime_type: {
      type: 'varchar(100)',
      notNull: true,
      comment: 'e.g., image/jpeg, audio/mpeg'
    },
    // Storage information
    file_url: {
      type: 'varchar(1000)',
      notNull: true
    },
    thumbnail_url: {
      type: 'varchar(1000)'
    },
    // File metadata
    file_name: {
      type: 'varchar(255)'
    },
    file_size: {
      type: 'bigint',
      comment: 'Size in bytes'
    },
    duration: {
      type: 'integer',
      comment: 'Duration in seconds for audio/video'
    },
    width: {
      type: 'integer',
      comment: 'Width in pixels for images'
    },
    height: {
      type: 'integer',
      comment: 'Height in pixels for images'
    },
    // Additional metadata
    metadata: {
      type: 'jsonb',
      default: '{}'
    },
    // Audit fields
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()')
    }
  }, { ifNotExists: true });

  // Indexes
  pgm.createIndex('chat_message_media', 'message_id', { name: 'idx_chat_message_media_message_id', ifNotExists: true });
  pgm.createIndex('chat_message_media', 'media_type', { name: 'idx_chat_message_media_type', ifNotExists: true });
};

exports.down = (pgm) => {
  pgm.dropTable('chat_message_media', { ifExists: true, cascade: true });
  pgm.dropType('chat_media_type', { ifExists: true });
};
