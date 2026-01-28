exports.up = (pgm) => {
  pgm.createTable('kitchen_users', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('uuid_generate_v4()'),
    },
    kitchen_id: { type: 'uuid' },
    name: { type: 'text' },
    phone: { type: 'text', notNull: true },
    email: { type: 'text' },
    bio: { type: 'text' },
    pin: { type: 'text' },
    is_kyc_verified: { type: 'boolean', default: false },
    status: { type: 'text', default: 'pending' },
    is_primary_owner: { type: 'boolean', default: false },
    date_of_birth: { type: 'date' },
    gender: { type: 'text' },
    joined_at: { type: 'timestamp', default: pgm.func('now()') },
    deleted_at: { type: 'timestamp' },
    relation_to_primary_owner: { type: 'text' },
    updated_at: { type: 'timestamp' },
  }, { ifNotExists: true });

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE kitchen_users ADD CONSTRAINT kitchen_users_phone_key UNIQUE (phone);
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE kitchen_users ADD CONSTRAINT uniq_user_per_kitchen UNIQUE (id, kitchen_id);
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  pgm.sql('CREATE INDEX IF NOT EXISTS kitchen_users_phone_idx ON kitchen_users (phone)');
  pgm.sql('CREATE INDEX IF NOT EXISTS kitchen_users_status_idx ON kitchen_users (status)');
};

exports.down = (pgm) => {
  pgm.dropTable('kitchen_users', { ifExists: true });
};
