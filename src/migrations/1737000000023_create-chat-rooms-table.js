/**
 * Migration: Create chat_rooms table
 * Core table for chat conversations - defines why the chat exists
 */

exports.up = (pgm) => {
  // Create ENUM types for chat
  pgm.createType('chat_type', [
    'customer_kitchen',
    'customer_admin',
    'customer_rider',
    'admin_kitchen',
    'admin_rider',
    'admin_admin'
  ]);

  pgm.createType('chat_initiator_type', [
    'customer',
    'kitchen_user',
    'rider',
    'admin'
  ]);

  pgm.createType('chat_topic_type', [
    'kitchen',
    'dish',
    'order',
    'delivery',
    'complaint',
    'feedback',
    'support_ticket',
    'general_inquiry'
  ]);

  pgm.createType('chat_room_status', [
    'open',
    'closed',
    'archived'
  ]);

  pgm.createType('chat_message_type', [
    'text',
    'image',
    'audio',
    'system',
    'internal'
  ]);

  // Create chat_rooms table
  pgm.createTable('chat_rooms', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()')
    },
    // Business reference ID (e.g., chat-ABC212)
    reference_id: {
      type: 'varchar(50)',
      notNull: true,
      unique: true
    },
    // Chat type defines allowed parties
    chat_type: {
      type: 'chat_type',
      notNull: true
    },
    // Who initiated the chat
    initiator_type: {
      type: 'chat_initiator_type',
      notNull: true
    },
    initiator_id: {
      type: 'uuid',
      notNull: true
    },
    // Topic - why does this chat exist
    topic_type: {
      type: 'chat_topic_type',
      notNull: true
    },
    topic_id: {
      type: 'uuid',
      comment: 'Nullable depending on topic_type'
    },
    // Room status
    status: {
      type: 'chat_room_status',
      notNull: true,
      default: 'open'
    },
    // Display title for the chat
    title: {
      type: 'varchar(255)'
    },
    // Summary view fields
    last_message_id: {
      type: 'uuid'
    },
    last_message_at: {
      type: 'timestamptz'
    },
    last_message_preview: {
      type: 'varchar(500)'
    },
    last_message_type: {
      type: 'chat_message_type'
    },
    // Metadata (JSON for flexibility)
    metadata: {
      type: 'jsonb',
      default: '{}'
    },
    // Lifecycle timestamps
    opened_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()')
    },
    closed_at: {
      type: 'timestamptz'
    },
    expires_at: {
      type: 'timestamptz',
      comment: 'When the chat should auto-close'
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

  // Indexes for common queries
  pgm.createIndex('chat_rooms', 'reference_id', { name: 'idx_chat_rooms_reference_id', ifNotExists: true });
  pgm.createIndex('chat_rooms', 'chat_type', { name: 'idx_chat_rooms_chat_type', ifNotExists: true });
  pgm.createIndex('chat_rooms', 'status', { name: 'idx_chat_rooms_status', ifNotExists: true });
  pgm.createIndex('chat_rooms', ['topic_type', 'topic_id'], { name: 'idx_chat_rooms_topic', ifNotExists: true });
  pgm.createIndex('chat_rooms', ['initiator_type', 'initiator_id'], { name: 'idx_chat_rooms_initiator', ifNotExists: true });
  pgm.createIndex('chat_rooms', 'last_message_at', { name: 'idx_chat_rooms_last_message_at', ifNotExists: true });
  pgm.createIndex('chat_rooms', 'expires_at', { name: 'idx_chat_rooms_expires_at', where: 'expires_at IS NOT NULL', ifNotExists: true });

  // Composite index for deterministic room lookup
  pgm.createIndex('chat_rooms', ['chat_type', 'topic_type', 'topic_id', 'status'], {
    name: 'idx_chat_rooms_deterministic_lookup',
    ifNotExists: true
  });
};

exports.down = (pgm) => {
  pgm.dropTable('chat_rooms', { ifExists: true, cascade: true });
  pgm.dropType('chat_message_type', { ifExists: true });
  pgm.dropType('chat_room_status', { ifExists: true });
  pgm.dropType('chat_topic_type', { ifExists: true });
  pgm.dropType('chat_initiator_type', { ifExists: true });
  pgm.dropType('chat_type', { ifExists: true });
};
