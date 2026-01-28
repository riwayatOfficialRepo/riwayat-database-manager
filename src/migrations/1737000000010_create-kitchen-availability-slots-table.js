exports.up = (pgm) => {
  pgm.createTable('kitchen_availability_slots', {
    id: { type: 'serial', primaryKey: true },
    name: { type: 'text', notNull: true },
    label_key: { type: 'text', notNull: true },
    default_start_time: { type: 'time' },
    default_end_time: { type: 'time' },
  }, { ifNotExists: true });

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE kitchen_availability_slots ADD CONSTRAINT kitchen_availability_slots_name_key UNIQUE (name);
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);
};

exports.down = (pgm) => {
  pgm.dropTable('kitchen_availability_slots', { ifExists: true });
};
