/**
 * Migration: Create chat_room_participants table
 * Who can access the room + read states
 */

exports.up = (pgm) => {
  pgm.createType('chat_participant_role', [
    'customer',
    'kitchen',
    'rider',
    'admin'
  ]);

  pgm.createType('chat_participant_status', [
    'active',
    'left',
    'banned'
  ]);

  pgm.createType('chat_identity_type', [
    'customer_personal',
    'kitchen_brand',
    'admin_brand',
    'rider_personal'
  ]);

  pgm.createTable('chat_room_participants', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()')
    },
    room_id: {
      type: 'uuid',
      notNull: true,
      references: 'chat_rooms(id)',
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
      comment: 'customer, kitchen_user, rider, admin'
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
      default: 'active'
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
  pgm.createIndex('chat_room_participants', 'room_id', { name: 'idx_chat_room_participants_room_id', ifNotExists: true });
  pgm.createIndex('chat_room_participants', ['user_id', 'user_type'], { name: 'idx_chat_room_participants_user', ifNotExists: true });
  pgm.createIndex('chat_room_participants', 'status', { name: 'idx_chat_room_participants_status', ifNotExists: true });
  pgm.createIndex('chat_room_participants', 'muted_until', { name: 'idx_chat_room_participants_muted', where: 'muted_until IS NOT NULL', ifNotExists: true });
  
  // Unique constraint: one user per room
  pgm.createIndex('chat_room_participants', ['room_id', 'user_id', 'user_type'], {
    name: 'idx_chat_room_participants_unique_user',
    unique: true,
    ifNotExists: true
  });

  // Index for inbox queries (user's active chats ordered by pinned + last message)
  pgm.createIndex('chat_room_participants', ['user_id', 'user_type', 'status', 'is_pinned'], {
    name: 'idx_chat_room_participants_inbox',
    ifNotExists: true
  });
};

exports.down = (pgm) => {
  pgm.dropTable('chat_room_participants', { ifExists: true, cascade: true });
  pgm.dropType('chat_identity_type', { ifExists: true });
  pgm.dropType('chat_participant_status', { ifExists: true });
  pgm.dropType('chat_participant_role', { ifExists: true });
};
