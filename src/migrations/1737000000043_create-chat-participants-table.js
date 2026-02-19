/**
 * Migration: Create chat_participants table
 * Who can access the chat + read states
 */

exports.up = (pgm) => {
  pgm.sql(`
    DO $$ BEGIN
      CREATE TYPE chat_participant_role AS ENUM (
        'CUSTOMER',
        'PARTNER',  -- Partner (kitchen users: CHEF or OWNER)
        'RIDER',
        'ADMIN'     -- Backend/Admin (roles are dynamic)
      );
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  pgm.sql(`
    DO $$ BEGIN
      CREATE TYPE chat_participant_status AS ENUM (
        'ACTIVE',
        'LEFT',
        'BANNED'
      );
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  pgm.sql(`
    DO $$ BEGIN
      CREATE TYPE chat_identity_type AS ENUM (
        'CUSTOMER_PERSONAL',
        'KITCHEN_BRAND',
        'ADMIN_BRAND',
        'RIDER_PERSONAL'
      );
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  pgm.createTable('chat_participants', {
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
    // User identity
    user_id: {
      type: 'uuid',
      notNull: true
    },
    user_type: {
      type: 'varchar(50)',
      notNull: true,
      comment: 'customer, partner, rider, admin. Partner sub-types (CHEF/OWNER) are stored in kitchen_users.roles'
    },
    // Role in this chat
    role: {
      type: 'chat_participant_role',
      notNull: true
    },
    // Participation status
    status: {
      type: 'chat_participant_status',
      notNull: true,
      default: 'ACTIVE'
    },
    // How the participant appears
    identity_type: {
      type: 'chat_identity_type',
      notNull: true
    },
    display_name: {
      type: 'varchar(100)'
    },
    avatar_url: {
      type: 'varchar(500)'
    },
    // Permissions
    can_send: {
      type: 'boolean',
      notNull: true,
      default: true
    },
    // Muting
    muted_until: {
      type: 'timestamptz'
    },
    // Read tracking
    last_read_message_id: {
      type: 'uuid'
    },
    unread_count: {
      type: 'integer',
      notNull: true,
      default: 0
    },
    // Chat features
    is_pinned: {
      type: 'boolean',
      notNull: true,
      default: false
    },
    // Notes (admin/internal use)
    notes: {
      type: 'text'
    },
    // Lifecycle timestamps
    joined_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()')
    },
    left_at: {
      type: 'timestamptz'
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
  pgm.createIndex('chat_participants', 'chat_id', { name: 'idx_chat_participants_chat_id', ifNotExists: true });
  pgm.createIndex('chat_participants', ['user_id', 'user_type'], { name: 'idx_chat_participants_user', ifNotExists: true });
  pgm.createIndex('chat_participants', 'status', { name: 'idx_chat_participants_status', ifNotExists: true });
  pgm.createIndex('chat_participants', 'muted_until', { name: 'idx_chat_participants_muted', where: 'muted_until IS NOT NULL', ifNotExists: true });
  
  // Unique constraint: one user per chat
  pgm.createIndex('chat_participants', ['chat_id', 'user_id', 'user_type'], {
    name: 'idx_chat_participants_unique_user',
    unique: true,
    ifNotExists: true
  });

  // Index for inbox queries (user's active chats ordered by pinned + last message)
  pgm.createIndex('chat_participants', ['user_id', 'user_type', 'status', 'is_pinned'], {
    name: 'idx_chat_participants_inbox',
    ifNotExists: true
  });
};

exports.down = (pgm) => {
  pgm.dropTable('chat_participants', { ifExists: true, cascade: true });
  pgm.dropType('chat_identity_type', { ifExists: true });
  pgm.dropType('chat_participant_status', { ifExists: true });
  pgm.dropType('chat_participant_role', { ifExists: true });
};
