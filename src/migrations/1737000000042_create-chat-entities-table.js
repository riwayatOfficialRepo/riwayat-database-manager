/**
 * Migration: Create chat_entities table
 * Links chats to domain entities for filtering/searching
 */

exports.up = (pgm) => {
  pgm.sql(`
    DO $$ BEGIN
      CREATE TYPE chat_entity_type AS ENUM (
        'CUSTOMER',
        'KITCHEN',
        'RIDER',
        'ADMIN_TEAM',
        'ORDER',
        'DISH',
        'DELIVERY',
        'COMPLAINT',
        'FEEDBACK',
        'SUPPORT_TICKET'
      );
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  pgm.createTable('chat_entities', {
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
    entity_type: {
      type: 'chat_entity_type',
      notNull: true
    },
    entity_id: {
      type: 'uuid',
      notNull: true
    },
    // Audit fields
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()')
    }
  }, { ifNotExists: true });

  // Indexes
  pgm.createIndex('chat_entities', 'chat_id', { name: 'idx_chat_entities_chat_id', ifNotExists: true });
  pgm.createIndex('chat_entities', ['entity_type', 'entity_id'], { name: 'idx_chat_entities_entity', ifNotExists: true });
  
  // Prevent duplicate entity assignments to same chat
  pgm.createIndex('chat_entities', ['chat_id', 'entity_type', 'entity_id'], {
    name: 'idx_chat_entities_unique',
    unique: true,
    ifNotExists: true
  });
};

exports.down = (pgm) => {
  pgm.dropTable('chat_entities', { ifExists: true, cascade: true });
  pgm.dropType('chat_entity_type', { ifExists: true });
};
