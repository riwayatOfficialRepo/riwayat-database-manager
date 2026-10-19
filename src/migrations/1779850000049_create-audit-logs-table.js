exports.up = (pgm) => {
  pgm.createTable(
    'audit_logs',
    {
      id:                  { type: 'uuid',        primaryKey: true, default: pgm.func('gen_random_uuid()'), notNull: true },
      initiator_type:      { type: 'varchar(50)' },
      initiator_id:        { type: 'uuid' },
      initiator_detail:    { type: 'jsonb' },
      scope_type:          { type: 'varchar(50)' },
      scope_id:            { type: 'uuid' },
      scope_detail:        { type: 'jsonb' },
      entity_type:         { type: 'varchar(50)' },
      entity_id:           { type: 'uuid' },
      entity_detail:       { type: 'jsonb' },
      event_type:          { type: 'varchar(100)' },
      output:              { type: 'jsonb' },
      reason_code:         { type: 'varchar(100)' },
      on_behalf_of_type:   { type: 'varchar(50)' },
      on_behalf_of_id:     { type: 'uuid' },
      on_behalf_of_detail: { type: 'jsonb' },
      payload:             { type: 'jsonb' },
      trace_id:            { type: 'varchar(255)' },
      source:              { type: 'varchar(100)' },
      service_name:        { type: 'varchar(100)' },
      environment:         { type: 'varchar(50)' },
      created_at:          { type: 'timestamptz', default: pgm.func('now()') },
      updated_at:          { type: 'timestamptz', default: pgm.func('now()') },
      comment:             { type: 'text' },
      deleted_at:          { type: 'timestamptz' },
    },
    { ifNotExists: true },
  );

  pgm.sql(`
    CREATE OR REPLACE FUNCTION update_audit_logs_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  pgm.sql(`
    CREATE OR REPLACE TRIGGER trg_update_audit_logs
      BEFORE UPDATE ON audit_logs
      FOR EACH ROW
      EXECUTE FUNCTION update_audit_logs_updated_at();
  `);
};

exports.down = (pgm) => {
  pgm.sql(`DROP TRIGGER IF EXISTS trg_update_audit_logs ON audit_logs`);
  pgm.sql(`DROP FUNCTION IF EXISTS update_audit_logs_updated_at()`);
  pgm.dropTable('audit_logs', { ifExists: true, cascade: true });
};
