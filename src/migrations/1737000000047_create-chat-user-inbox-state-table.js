/**
 * Migration: Create chat_user_inbox_state table
 * Optional speed-up table for unread counts and inbox state
 */

exports.up = (pgm) => {
  pgm.createTable('chat_user_inbox_state', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()')
    },
    // User identity
    user_id: {
      type: 'uuid',
      notNull: true
    },
    user_type: {
      type: 'varchar(50)',
      notNull: true
    },
    // Aggregated counts
    total_unread_count: {
      type: 'integer',
      notNull: true,
      default: 0
    },
    total_unread_rooms: {
      type: 'integer',
      notNull: true,
      default: 0
    },
    // Last activity
    last_active_at: {
      type: 'timestamptz'
    },
    // Cache metadata
    last_synced_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()')
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

  // Unique constraint: one state per user
  pgm.createIndex('chat_user_inbox_state', ['user_id', 'user_type'], {
    name: 'idx_chat_user_inbox_state_unique',
    unique: true,
    ifNotExists: true
  });
};

exports.down = (pgm) => {
  pgm.dropTable('chat_user_inbox_state', { ifExists: true, cascade: true });
};
