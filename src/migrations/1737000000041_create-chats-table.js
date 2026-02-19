/**
 * Migration: Create chats table
 * Core table for chat conversations - defines why the chat exists
 */

exports.up = (pgm) => {
  // Create ENUM types for chat (with existence checks, all uppercase)
  pgm.sql(`
    DO $$ BEGIN
      CREATE TYPE chat_type AS ENUM (
        'CUSTOMER_KITCHEN',
        'CUSTOMER_ADMIN',
        'CUSTOMER_RIDER',
        'ADMIN_KITCHEN',
        'ADMIN_RIDER',
        'ADMIN_ADMIN'
      );
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  pgm.sql(`
    DO $$ BEGIN
      CREATE TYPE chat_initiator_type AS ENUM (
        'CUSTOMER',
        'KITCHEN_USER',
        'RIDER',
        'ADMIN'
      );
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  pgm.sql(`
    DO $$ BEGIN
      CREATE TYPE chat_topic_type AS ENUM (
        'KITCHEN',
        'DISH',
        'ORDER',
        'DELIVERY',
        'COMPLAINT',
        'FEEDBACK',
        'SUPPORT_TICKET',
        'GENERAL_INQUIRY'
      );
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  pgm.sql(`
    DO $$ BEGIN
      CREATE TYPE chat_status AS ENUM (
        'OPEN',
        'CLOSED',
        'ARCHIVED'
      );
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  pgm.sql(`
    DO $$ BEGIN
      CREATE TYPE chat_message_type AS ENUM (
        'TEXT',
        'IMAGE',
        'AUDIO',
        'SYSTEM',
        'INTERNAL'
      );
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  // Create chats table
  pgm.createTable('chats', {
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
    // Chat status
    status: {
      type: 'chat_status',
      notNull: true,
      default: 'OPEN'
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
  pgm.createIndex('chats', 'reference_id', { name: 'idx_chats_reference_id', ifNotExists: true });
  pgm.createIndex('chats', 'chat_type', { name: 'idx_chats_chat_type', ifNotExists: true });
  pgm.createIndex('chats', 'status', { name: 'idx_chats_status', ifNotExists: true });
  pgm.createIndex('chats', ['topic_type', 'topic_id'], { name: 'idx_chats_topic', ifNotExists: true });
  pgm.createIndex('chats', ['initiator_type', 'initiator_id'], { name: 'idx_chats_initiator', ifNotExists: true });
  pgm.createIndex('chats', 'last_message_at', { name: 'idx_chats_last_message_at', ifNotExists: true });
  pgm.createIndex('chats', 'expires_at', { name: 'idx_chats_expires_at', where: 'expires_at IS NOT NULL', ifNotExists: true });

  // Composite index for deterministic chat lookup
  pgm.createIndex('chats', ['chat_type', 'topic_type', 'topic_id', 'status'], {
    name: 'idx_chats_deterministic_lookup',
    ifNotExists: true
  });
};

exports.down = (pgm) => {
  pgm.dropTable('chats', { ifExists: true, cascade: true });
  pgm.dropType('chat_message_type', { ifExists: true });
  pgm.dropType('chat_status', { ifExists: true });
  pgm.dropType('chat_topic_type', { ifExists: true });
  pgm.dropType('chat_initiator_type', { ifExists: true });
  pgm.dropType('chat_type', { ifExists: true });
};
