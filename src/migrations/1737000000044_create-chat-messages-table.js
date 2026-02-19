/**
 * Migration: Create chat_messages table
 * Stores all chat messages
 */

exports.up = (pgm) => {
  pgm.createTable('chat_messages', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()')
    },
    chat_id: {
      type: 'uuid',
      notNull: true,
      references: 'chats(id)',
      onDelete: 'CASCADE'
    },
    // Sender information
    sender_id: {
      type: 'uuid',
      notNull: true
    },
    sender_type: {
      type: 'varchar(50)',
      notNull: true,
      comment: 'customer, partner, rider, admin, system. Partner sub-types (CHEF/OWNER) are stored in kitchen_users.roles'
    },
    participant_id: {
      type: 'uuid',
      references: 'chat_participants(id)',
      onDelete: 'SET NULL',
      comment: 'Reference to participant record'
    },
    // Message content
    message_type: {
      type: 'chat_message_type',
      notNull: true,
      default: 'TEXT'
    },
    content: {
      type: 'text',
      comment: 'Text content of the message'
    },
    // Reply support
    reply_to_message_id: {
      type: 'uuid',
      references: 'chat_messages(id)',
      onDelete: 'SET NULL'
    },
    // Client-side deduplication
    client_msg_id: {
      type: 'varchar(100)',
      comment: 'Client-generated message ID for deduplication'
    },
    // Metadata (platform, source screen, etc.)
    metadata: {
      type: 'jsonb',
      default: '{}'
    },
    // Edit/Delete tracking
    is_edited: {
      type: 'boolean',
      notNull: true,
      default: false
    },
    edited_at: {
      type: 'timestamptz'
    },
    is_deleted: {
      type: 'boolean',
      notNull: true,
      default: false
    },
    deleted_at: {
      type: 'timestamptz'
    },
    delete_reason: {
      type: 'varchar(255)'
    },
    // Audit fields
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()')
    },
    updated_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()')
    }
  }, { ifNotExists: true });

  // Indexes
  pgm.createIndex('chat_messages', 'chat_id', { name: 'idx_chat_messages_chat_id', ifNotExists: true });
  pgm.createIndex('chat_messages', ['sender_id', 'sender_type'], { name: 'idx_chat_messages_sender', ifNotExists: true });
  pgm.createIndex('chat_messages', 'created_at', { name: 'idx_chat_messages_created_at', ifNotExists: true });
  pgm.createIndex('chat_messages', 'reply_to_message_id', { name: 'idx_chat_messages_reply_to', where: 'reply_to_message_id IS NOT NULL', ifNotExists: true });
  
  // Index for fetching messages in a chat (pagination)
  pgm.createIndex('chat_messages', ['chat_id', 'created_at'], {
    name: 'idx_chat_messages_chat_chronological',
    ifNotExists: true
  });

  // Unique constraint for client_msg_id per chat (deduplication)
  pgm.createIndex('chat_messages', ['chat_id', 'client_msg_id'], {
    name: 'idx_chat_messages_client_dedup',
    unique: true,
    where: 'client_msg_id IS NOT NULL',
    ifNotExists: true
  });
};

exports.down = (pgm) => {
  pgm.dropTable('chat_messages', { ifExists: true, cascade: true });
};
