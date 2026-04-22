/**
 * Migration: Create modifiers and modifiers_staging tables
 */

exports.up = (pgm) => {
  // ── trigger functions ────────────────────────────────────────
  pgm.sql(`
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  pgm.sql(`
    CREATE OR REPLACE FUNCTION update_modifiers_staging_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  // ── modifiers ────────────────────────────────────────────────
  pgm.createTable('modifiers', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    dish_id: { type: 'uuid', notNull: true },
    name: { type: 'varchar(255)', notNull: true },
    selection_type: { type: 'varchar(20)', notNull: true, default: "'SINGLE'" },
    is_required: { type: 'boolean', notNull: true, default: false },
    status: { type: 'varchar(20)', notNull: true, default: "'ACTIVE'" },
    options: { type: 'jsonb', notNull: true },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    deleted_at: { type: 'timestamptz' },
  }, { ifNotExists: true });

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE modifiers ADD CONSTRAINT fk_modifiers_dish
        FOREIGN KEY (dish_id) REFERENCES dishes(id)
        ON UPDATE NO ACTION ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  pgm.sql(`
    CREATE OR REPLACE TRIGGER update_modifiers_updated_at
      BEFORE UPDATE ON modifiers
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  `);

  // ── modifiers_staging ────────────────────────────────────────
  pgm.createTable('modifiers_staging', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    dish_staging_id: { type: 'uuid', notNull: true },
    name: { type: 'varchar(255)', notNull: true },
    selection_type: { type: 'varchar(20)', notNull: true, default: "'SINGLE'" },
    is_required: { type: 'boolean', notNull: true, default: false },
    status: { type: 'varchar(20)', notNull: true, default: "'ACTIVE'" },
    options: { type: 'jsonb', notNull: true },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    deleted_at: { type: 'timestamptz' },
    modifier_id: { type: 'uuid' },
  }, { ifNotExists: true });

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE modifiers_staging ADD CONSTRAINT fk_modifiers_staging_dish
        FOREIGN KEY (dish_staging_id) REFERENCES dishes_staging(id)
        ON UPDATE NO ACTION ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE modifiers_staging ADD CONSTRAINT fk_modifiers_staging_modifier_id
        FOREIGN KEY (modifier_id) REFERENCES modifiers(id)
        ON UPDATE NO ACTION ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  pgm.sql(`
    CREATE OR REPLACE TRIGGER update_modifiers_staging_updated_at
      BEFORE UPDATE ON modifiers_staging
      FOR EACH ROW
      EXECUTE FUNCTION update_modifiers_staging_updated_at();
  `);
};

exports.down = (pgm) => {
  pgm.sql(`DROP TRIGGER IF EXISTS update_modifiers_staging_updated_at ON modifiers_staging`);
  pgm.dropTable('modifiers_staging', { ifExists: true, cascade: true });
  pgm.sql(`DROP TRIGGER IF EXISTS update_modifiers_updated_at ON modifiers`);
  pgm.dropTable('modifiers', { ifExists: true, cascade: true });
};
