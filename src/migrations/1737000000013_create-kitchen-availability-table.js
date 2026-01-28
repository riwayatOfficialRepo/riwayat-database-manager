exports.up = (pgm) => {
  pgm.createTable('kitchen_availability', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('uuid_generate_v4()'),
    },
    kitchen_id: { type: 'uuid' },
    day_of_week_id: { type: 'char(3)' },
    slot_id: { type: 'integer' },
    is_available: { type: 'boolean', default: false },
    custom_start_time: { type: 'time' },
    custom_end_time: { type: 'time' },
    created_at: { type: 'timestamp', default: pgm.func('now()') },
    updated_at: { type: 'timestamp', default: pgm.func('now()') },
    status: { type: 'varchar(20)', default: 'draft' },
    is_record_changed: { type: 'boolean', default: false },
  }, { ifNotExists: true });

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE kitchen_availability
        ADD CONSTRAINT fk_kitchen_availability_kitchen_id
        FOREIGN KEY (kitchen_id) REFERENCES kitchens(id) ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE kitchen_availability
        ADD CONSTRAINT kitchen_availability_day_of_week_id_fkey
        FOREIGN KEY (day_of_week_id) REFERENCES days_of_week(id);
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE kitchen_availability
        ADD CONSTRAINT kitchen_availability_slot_id_fkey
        FOREIGN KEY (slot_id) REFERENCES kitchen_availability_slots(id);
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);
};

exports.down = (pgm) => {
  pgm.dropTable('kitchen_availability', { ifExists: true });
};
