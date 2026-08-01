exports.up = (pgm) => {
  pgm.createTable(
    'devices',
    {
      id:                    { type: 'uuid',        primaryKey: true, default: pgm.func('gen_random_uuid()'), notNull: true },
      device_reference:      { type: 'varchar(255)' },
      owner_id:              { type: 'uuid' },
      owner_reference:       { type: 'varchar(255)' },
      owner_type:            { type: 'varchar(50)' },
      platform:              { type: 'varchar(50)' },
      status:                { type: 'varchar(50)' },
      fcm_token:             { type: 'text' },
      fcm_token_updated_at:  { type: 'timestamptz' },
      last_seen_at:          { type: 'timestamptz' },
      device_details:        { type: 'jsonb' },
      registered_at:         { type: 'timestamptz' },
      registered_by_details: { type: 'jsonb' },
      revoked_at:            { type: 'timestamptz' },
      revoked_by_details:    { type: 'jsonb' },
      is_deleted:            { type: 'boolean',     default: false },
      deleted_at:            { type: 'timestamptz' },
      deleted_by_details:    { type: 'jsonb' },
      created_at:            { type: 'timestamptz', default: pgm.func('now()') },
      updated_at:            { type: 'timestamptz', default: pgm.func('now()') },
    },
    { ifNotExists: true },
  );

  pgm.sql(`
    CREATE OR REPLACE FUNCTION update_devices_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  pgm.sql(`
    CREATE OR REPLACE TRIGGER trg_update_devices
      BEFORE UPDATE ON devices
      FOR EACH ROW
      EXECUTE FUNCTION update_devices_updated_at();
  `);
};

exports.down = (pgm) => {
  pgm.sql(`DROP TRIGGER IF EXISTS trg_update_devices ON devices`);
  pgm.sql(`DROP FUNCTION IF EXISTS update_devices_updated_at()`);
  pgm.dropTable('devices', { ifExists: true, cascade: true });
};
