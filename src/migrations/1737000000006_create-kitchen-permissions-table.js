exports.up = (pgm) => {
  pgm.createTable('kitchen_permissions', {
    id: { type: 'serial', primaryKey: true },
    key: { type: 'text', notNull: true },
    label_key: { type: 'text' },
    name: { type: 'text' },
    description: { type: 'text' },
    created_at: { type: 'timestamp', default: pgm.func('now()') },
    updated_at: { type: 'timestamp', default: pgm.func('now()') },
    deleted_at: { type: 'timestamp' },
  }, { ifNotExists: true });

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE kitchen_permissions ADD CONSTRAINT kitchen_permissions_key_key UNIQUE (key);
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);
};

exports.down = (pgm) => {
  pgm.dropTable('kitchen_permissions', { ifExists: true });
};
