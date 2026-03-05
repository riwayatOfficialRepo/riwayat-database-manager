/**
 * Migration: Rename chat_participants columns
 * - user_type -> user_entity_type
 * - role -> user_role
 *
 * Updates indexes and unique constraints that reference these columns.
 */

exports.up = (pgm) => {
  // Drop indexes that reference the columns we're renaming
  pgm.sql(`DROP INDEX IF EXISTS idx_chat_participants_user`);
  pgm.sql(`DROP INDEX IF EXISTS idx_chat_participants_unique_user`);
  pgm.sql(`DROP INDEX IF EXISTS idx_chat_participants_inbox`);

  // Rename columns
  pgm.renameColumn('chat_participants', 'user_type', 'user_entity_type');
  pgm.renameColumn('chat_participants', 'role', 'user_role');

  // Recreate indexes with new column names
  pgm.createIndex('chat_participants', ['user_id', 'user_entity_type'], {
    name: 'idx_chat_participants_user',
    ifNotExists: true,
  });
  pgm.createIndex('chat_participants', ['chat_id', 'user_id', 'user_entity_type'], {
    name: 'idx_chat_participants_unique_user',
    unique: true,
    ifNotExists: true,
  });
  pgm.createIndex('chat_participants', ['user_id', 'user_entity_type', 'status', 'is_pinned'], {
    name: 'idx_chat_participants_inbox',
    ifNotExists: true,
  });
};

exports.down = (pgm) => {
  // Drop indexes
  pgm.sql(`DROP INDEX IF EXISTS idx_chat_participants_user`);
  pgm.sql(`DROP INDEX IF EXISTS idx_chat_participants_unique_user`);
  pgm.sql(`DROP INDEX IF EXISTS idx_chat_participants_inbox`);

  // Rename columns back
  pgm.renameColumn('chat_participants', 'user_entity_type', 'user_type');
  pgm.renameColumn('chat_participants', 'user_role', 'role');

  // Recreate original indexes
  pgm.createIndex('chat_participants', ['user_id', 'user_type'], {
    name: 'idx_chat_participants_user',
    ifNotExists: true,
  });
  pgm.createIndex('chat_participants', ['chat_id', 'user_id', 'user_type'], {
    name: 'idx_chat_participants_unique_user',
    unique: true,
    ifNotExists: true,
  });
  pgm.createIndex('chat_participants', ['user_id', 'user_type', 'status', 'is_pinned'], {
    name: 'idx_chat_participants_inbox',
    ifNotExists: true,
  });
};
