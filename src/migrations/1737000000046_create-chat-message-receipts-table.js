/**
 * Migration: Create chat_message_receipts table
 * Tracks delivery and read status per message per participant
 */

exports.up = (pgm) => {
  pgm.sql(`
    DO $$ BEGIN
      CREATE TYPE chat_receipt_status AS ENUM (
        'DELIVERED',
        'READ'
      );
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  pgm.createTable('chat_message_receipts', {
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
    participant_id: {
      type: 'uuid',
      notNull: true,
      references: 'chat_participants(id)',
      onDelete: 'CASCADE'
    },
    status: {
      type: 'chat_receipt_status',
      notNull: true
    },
    // Timestamp when status was set
    timestamp: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()')
    }
  }, { ifNotExists: true });

  // Indexes
  pgm.createIndex('chat_message_receipts', 'message_id', { name: 'idx_chat_message_receipts_message_id', ifNotExists: true });
  pgm.createIndex('chat_message_receipts', 'participant_id', { name: 'idx_chat_message_receipts_participant_id', ifNotExists: true });
  
  // Unique constraint: one receipt per message per participant per status
  pgm.createIndex('chat_message_receipts', ['message_id', 'participant_id', 'status'], {
    name: 'idx_chat_message_receipts_unique',
    unique: true,
    ifNotExists: true
  });
};

exports.down = (pgm) => {
  pgm.dropTable('chat_message_receipts', { ifExists: true, cascade: true });
  pgm.dropType('chat_receipt_status', { ifExists: true });
};
