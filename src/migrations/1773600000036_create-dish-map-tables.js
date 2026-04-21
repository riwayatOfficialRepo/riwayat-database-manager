/**
 * Migration: Create dish map tables for tags, cuisines, and dietary flags (with staging)
 */

exports.up = (pgm) => {
  // ── dish_cuisine_map ─────────────────────────────────────────
  pgm.createTable('dish_cuisine_map', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    dish_id: { type: 'uuid', notNull: true },
    cuisine_id: { type: 'integer', notNull: true },
    status: { type: 'varchar(20)', notNull: true, default: "'ACTIVE'" },
    created_at: { type: 'timestamp', default: pgm.func('now()') },
  }, { ifNotExists: true });

  pgm.sql(`CREATE UNIQUE INDEX IF NOT EXISTS dish_cuisine_map_dish_id_cuisine_id_key ON dish_cuisine_map (dish_id, cuisine_id)`);

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE dish_cuisine_map ADD CONSTRAINT dish_cuisine_map_cuisine_id_fkey
        FOREIGN KEY (cuisine_id) REFERENCES dish_cuisines(id) ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  // ── dish_cuisine_map_staging ─────────────────────────────────
  pgm.createTable('dish_cuisine_map_staging', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    dish_staging_id: { type: 'uuid', notNull: true },
    dish_cuisine_map_id: { type: 'uuid' },
    status: { type: 'varchar(20)', notNull: true, default: "'DRAFT'" },
    created_at: { type: 'timestamp', default: pgm.func('now()') },
  }, { ifNotExists: true });

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE dish_cuisine_map_staging ADD CONSTRAINT dish_cuisine_map_staging_dish_cuisine_map_id_fkey
        FOREIGN KEY (dish_cuisine_map_id) REFERENCES dish_cuisine_map(id) ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  // ── dish_tag_map ─────────────────────────────────────────────
  pgm.createTable('dish_tag_map', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    dish_id: { type: 'uuid', notNull: true },
    tag_id: { type: 'integer', notNull: true },
    status: { type: 'varchar(20)', notNull: true, default: "'ACTIVE'" },
    created_at: { type: 'timestamp', default: pgm.func('now()') },
  }, { ifNotExists: true });

  pgm.sql(`CREATE UNIQUE INDEX IF NOT EXISTS dish_tag_map_dish_id_tag_id_key ON dish_tag_map (dish_id, tag_id)`);

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE dish_tag_map ADD CONSTRAINT dish_tag_map_tag_id_fkey
        FOREIGN KEY (tag_id) REFERENCES dish_tags(id) ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  // ── dish_tag_map_staging ─────────────────────────────────────
  pgm.createTable('dish_tag_map_staging', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    dish_staging_id: { type: 'uuid', notNull: true },
    dish_tag_map_id: { type: 'uuid' },
    status: { type: 'varchar(20)', notNull: true, default: "'DRAFT'" },
    created_at: { type: 'timestamp', default: pgm.func('now()') },
  }, { ifNotExists: true });

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE dish_tag_map_staging ADD CONSTRAINT dish_tag_map_staging_dish_tag_map_id_fkey
        FOREIGN KEY (dish_tag_map_id) REFERENCES dish_tag_map(id) ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  // ── dish_dietary_map ─────────────────────────────────────────
  pgm.createTable('dish_dietary_map', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    dish_id: { type: 'uuid', notNull: true },
    dietary_id: { type: 'integer', notNull: true },
    status: { type: 'varchar(20)', notNull: true, default: "'ACTIVE'" },
    created_at: { type: 'timestamp', default: pgm.func('now()') },
  }, { ifNotExists: true });

  pgm.sql(`CREATE UNIQUE INDEX IF NOT EXISTS dish_dietary_map_dish_id_dietary_id_key ON dish_dietary_map (dish_id, dietary_id)`);

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE dish_dietary_map ADD CONSTRAINT dish_dietary_map_dietary_id_fkey
        FOREIGN KEY (dietary_id) REFERENCES dish_dietary_flags(id) ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  // ── dish_dietary_map_staging ─────────────────────────────────
  pgm.createTable('dish_dietary_map_staging', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    dish_staging_id: { type: 'uuid', notNull: true },
    dish_dietary_map_id: { type: 'uuid' },
    status: { type: 'varchar(20)', notNull: true, default: "'DRAFT'" },
    created_at: { type: 'timestamp', default: pgm.func('now()') },
  }, { ifNotExists: true });

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE dish_dietary_map_staging ADD CONSTRAINT dish_dietary_map_staging_dish_dietary_map_id_fkey
        FOREIGN KEY (dish_dietary_map_id) REFERENCES dish_dietary_map(id) ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);
};

exports.down = (pgm) => {
  pgm.dropTable('dish_dietary_map_staging', { ifExists: true, cascade: true });
  pgm.dropTable('dish_dietary_map', { ifExists: true, cascade: true });
  pgm.dropTable('dish_tag_map_staging', { ifExists: true, cascade: true });
  pgm.dropTable('dish_tag_map', { ifExists: true, cascade: true });
  pgm.dropTable('dish_cuisine_map_staging', { ifExists: true, cascade: true });
  pgm.dropTable('dish_cuisine_map', { ifExists: true, cascade: true });
};
