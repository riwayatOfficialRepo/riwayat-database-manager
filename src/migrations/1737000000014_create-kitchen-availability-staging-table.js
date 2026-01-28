exports.up = (pgm) => {
  pgm.createTable('kitchen_availability_staging', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('uuid_generate_v4()'),
    },
    kitchen_availability_id: { type: 'uuid' },
    kitchen_staging_id: { type: 'uuid' },
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
      ALTER TABLE kitchen_availability_staging
        ADD CONSTRAINT kitchen_availability_staging_kitchen_availability_id_fkey
        FOREIGN KEY (kitchen_availability_id) REFERENCES kitchen_availability(id);
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE kitchen_availability_staging
        ADD CONSTRAINT kitchen_availability_staging_kitchen_staging_id_fkey
        FOREIGN KEY (kitchen_staging_id) REFERENCES kitchens_staging(id);
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE kitchen_availability_staging
        ADD CONSTRAINT kitchen_availability_staging_day_of_week_id_fkey
        FOREIGN KEY (day_of_week_id) REFERENCES days_of_week(id);
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE kitchen_availability_staging
        ADD CONSTRAINT kitchen_availability_staging_slot_id_fkey
        FOREIGN KEY (slot_id) REFERENCES kitchen_availability_slots(id);
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);
};

exports.down = (pgm) => {
  pgm.dropTable('kitchen_availability_staging', { ifExists: true });
};
