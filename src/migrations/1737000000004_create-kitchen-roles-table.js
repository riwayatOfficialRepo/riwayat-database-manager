exports.up = (pgm) => {
  pgm.createTable('kitchen_roles', {
    id: { type: 'serial', primaryKey: true },
    name: { type: 'text', notNull: true },
    label_key: { type: 'text' },
    description: { type: 'text' },
    created_at: { type: 'timestamp', default: pgm.func('now()') },
    updated_at: { type: 'timestamp' },
    status: { type: 'varchar(20)', notNull: true, default: 'ACTIVE' },
  }, { ifNotExists: true });

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE kitchen_roles ADD CONSTRAINT kitchen_roles_name_key UNIQUE (name);
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);
};

exports.down = (pgm) => {
  pgm.dropTable('kitchen_roles', { ifExists: true });
};
