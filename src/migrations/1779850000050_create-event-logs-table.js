exports.up = (pgm) => {
  pgm.createTable(
    'event_logs',
    {
      event_log_id:   { type: 'uuid',        primaryKey: true, default: pgm.func('gen_random_uuid()'), notNull: true },
      event_code:     { type: 'varchar(100)', notNull: true },
      source_payload: { type: 'jsonb',        notNull: true },
      status:         { type: 'varchar(50)',  notNull: true },
      error:          { type: 'text' },
      retry_count:    { type: 'integer',      notNull: true, default: 0 },
      processed_at:   { type: 'timestamptz' },
      created_at:     { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    },
    { ifNotExists: true },
  );

  pgm.sql(`CREATE INDEX IF NOT EXISTS idx_event_log_created_at ON event_logs (created_at)`);
  pgm.sql(`CREATE INDEX IF NOT EXISTS idx_event_log_event_code ON event_logs (event_code)`);
  pgm.sql(`CREATE INDEX IF NOT EXISTS idx_event_log_status     ON event_logs (status)`);
};

exports.down = (pgm) => {
  pgm.sql(`DROP INDEX IF EXISTS idx_event_log_status`);
  pgm.sql(`DROP INDEX IF EXISTS idx_event_log_event_code`);
  pgm.sql(`DROP INDEX IF EXISTS idx_event_log_created_at`);
  pgm.dropTable('event_logs', { ifExists: true, cascade: true });
};
