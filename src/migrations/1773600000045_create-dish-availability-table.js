/**
 * Migration: Create dish_availability and dish_availability_staging tables
 */

exports.up = (pgm) => {
  // ── dish_availability ────────────────────────────────────────
  pgm.createTable('dish_availability', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('uuid_generate_v4()') },
    dish_id: { type: 'uuid', notNull: true },
    kitchen_availability_id: { type: 'uuid', notNull: true },
    is_available: { type: 'boolean', default: true },
    custom_start_time: { type: 'time' },
    custom_end_time: { type: 'time' },
    status: { type: 'varchar(20)', default: "'ACTIVE'" },
    created_at: { type: 'timestamp', default: pgm.func('now()') },
    updated_at: { type: 'timestamp', default: pgm.func('now()') },
  }, { ifNotExists: true });

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE dish_availability ADD CONSTRAINT dish_availability_dish_id_fkey
        FOREIGN KEY (dish_id) REFERENCES dishes(id)
        ON UPDATE NO ACTION ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE dish_availability ADD CONSTRAINT dish_availability_kitchen_availability_id_fkey
        FOREIGN KEY (kitchen_availability_id) REFERENCES kitchen_availability(id)
        ON UPDATE NO ACTION ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  // ── dish_availability_staging ────────────────────────────────
  pgm.createTable('dish_availability_staging', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('uuid_generate_v4()') },
    dish_availability_id: { type: 'uuid', notNull: true },
    dish_staging_id: { type: 'uuid', notNull: true },
    kitchen_availability_id: { type: 'uuid', notNull: true },
    is_available: { type: 'boolean', default: true },
    custom_start_time: { type: 'time' },
    custom_end_time: { type: 'time' },
    status: { type: 'varchar(20)', default: "'DRAFT'" },
    created_at: { type: 'timestamp', default: pgm.func('now()') },
    updated_at: { type: 'timestamp', default: pgm.func('now()') },
  }, { ifNotExists: true });

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE dish_availability_staging ADD CONSTRAINT dish_availability_staging_dish_availability_id_fkey
        FOREIGN KEY (dish_availability_id) REFERENCES dish_availability(id)
        ON UPDATE NO ACTION ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE dish_availability_staging ADD CONSTRAINT dish_availability_staging_kitchen_availability_id_fkey
        FOREIGN KEY (kitchen_availability_id) REFERENCES kitchen_availability(id)
        ON UPDATE NO ACTION ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);
};

exports.down = (pgm) => {
  pgm.dropTable('dish_availability_staging', { ifExists: true, cascade: true });
  pgm.dropTable('dish_availability', { ifExists: true, cascade: true });
};
