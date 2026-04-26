/**
 * Migration: Create dish_special_events and dish_special_events_staging tables
 */

exports.up = (pgm) => {
  // ── dish_special_events ──────────────────────────────────────
  pgm.createTable('dish_special_events', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    dish_id: { type: 'uuid', notNull: true },
    event_start: { type: 'timestamp' },
    event_end: { type: 'timestamp' },
    preorder_start: { type: 'timestamp' },
    preorder_end: { type: 'timestamp' },
    created_at: { type: 'timestamp', default: pgm.func('now()') },
    updated_at: { type: 'timestamp', default: pgm.func('now()') },
    deleted_at: { type: 'timestamp' },
    status: { type: 'varchar(30)', default: "'DRAFT'" },
    change_in_progress: { type: 'boolean', notNull: true, default: false },
    delivery_start_time: { type: 'time' },
    delivery_end_time: { type: 'time' },
  }, { ifNotExists: true });

  pgm.sql(`
    CREATE UNIQUE INDEX IF NOT EXISTS dish_special_events_dish_id_unique
      ON dish_special_events (dish_id);
  `);

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE dish_special_events ADD CONSTRAINT dish_special_events_dish_id_fkey
        FOREIGN KEY (dish_id) REFERENCES dishes(id)
        ON UPDATE NO ACTION ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  // ── dish_special_events_staging ──────────────────────────────
  pgm.createTable('dish_special_events_staging', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    dish_special_event_id: { type: 'uuid', notNull: true },
    dish_staging_id: { type: 'uuid', notNull: true },
    event_start: { type: 'timestamp' },
    event_end: { type: 'timestamp' },
    preorder_start: { type: 'timestamp' },
    preorder_end: { type: 'timestamp' },
    status: { type: 'varchar(50)', notNull: true, default: "'DRAFT'" },
    created_at: { type: 'timestamp', default: pgm.func('now()') },
    updated_at: { type: 'timestamp', default: pgm.func('now()') },
    deleted_at: { type: 'timestamp' },
    change_in_progress: { type: 'boolean', notNull: true, default: false },
    delivery_start_time: { type: 'time' },
    delivery_end_time: { type: 'time' },
  }, { ifNotExists: true });

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE dish_special_events_staging ADD CONSTRAINT dish_special_event_staging_fkey
        FOREIGN KEY (dish_special_event_id) REFERENCES dish_special_events(id)
        ON UPDATE NO ACTION ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);
};

exports.down = (pgm) => {
  pgm.dropTable('dish_special_events_staging', { ifExists: true, cascade: true });
  pgm.dropTable('dish_special_events', { ifExists: true, cascade: true });
};
