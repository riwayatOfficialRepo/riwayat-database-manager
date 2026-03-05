/**
 * Migration: Remove client_msg_id from chat_messages table
 * Drops the deduplication index and the column.
 */

exports.up = (pgm) => {
  // Drop index that references client_msg_id
  pgm.sql(`DROP INDEX IF EXISTS idx_chat_messages_client_dedup`);

  // Drop the column
  pgm.dropColumn('chat_messages', 'client_msg_id');
};

exports.down = (pgm) => {
  // Re-add the column
  pgm.addColumn('chat_messages', {
    client_msg_id: {
      type: 'varchar(100)',
      comment: 'Client-generated message ID for deduplication',
    },
  });

  // Recreate the unique index for deduplication
  pgm.createIndex('chat_messages', ['chat_id', 'client_msg_id'], {
    name: 'idx_chat_messages_client_dedup',
    unique: true,
    where: 'client_msg_id IS NOT NULL',
    ifNotExists: true,
  });
};
