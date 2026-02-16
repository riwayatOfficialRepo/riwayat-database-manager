/**
 * Migration: Create chat_room_entities table
 * Links rooms to domain entities for filtering/searching
 */

exports.up = (pgm) => {
  pgm.createType('chat_entity_type', [
    'customer',
    'kitchen',
    'rider',
    'admin_team',
    'order',
    'dish',
    'delivery',
    'complaint',
    'feedback',
    'support_ticket'
  ]);

  pgm.createTable('chat_room_entities', {
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
  pgm.createIndex('chat_room_entities', 'room_id', { name: 'idx_chat_room_entities_room_id', ifNotExists: true });
  pgm.createIndex('chat_room_entities', ['entity_type', 'entity_id'], { name: 'idx_chat_room_entities_entity', ifNotExists: true });
  
  // Prevent duplicate entity assignments to same room
  pgm.createIndex('chat_room_entities', ['room_id', 'entity_type', 'entity_id'], {
    name: 'idx_chat_room_entities_unique',
    unique: true,
    ifNotExists: true
  });
};

exports.down = (pgm) => {
  pgm.dropTable('chat_room_entities', { ifExists: true, cascade: true });
  pgm.dropType('chat_entity_type', { ifExists: true });
};
