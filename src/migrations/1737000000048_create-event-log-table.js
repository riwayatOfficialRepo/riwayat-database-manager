/**
 * Migration: Create event_log table
 * Table for logging events with their payloads and status
 */

exports.up = (pgm) => {
  pgm.createTable('event_log', {
    event_log_id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
      notNull: true
    },
    event_code: {
      type: 'varchar(100)',
      notNull: true
    },
    source_payload: {
      type: 'jsonb',
      notNull: true
    },
    status: {
      type: 'varchar(50)',
      notNull: true
    },
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()')
    }
  }, { ifNotExists: true });

  // Index on event_code for faster lookups
  pgm.createIndex('event_log', 'event_code', {
    name: 'idx_event_log_event_code',
    ifNotExists: true
  });

  // Index on status for filtering by status
  pgm.createIndex('event_log', 'status', {
    name: 'idx_event_log_status',
    ifNotExists: true
  });

  // Index on created_at for time-based queries
  pgm.createIndex('event_log', 'created_at', {
    name: 'idx_event_log_created_at',
    ifNotExists: true
  });
};

exports.down = (pgm) => {
  pgm.dropTable('event_log', { ifExists: true, cascade: true });
};
