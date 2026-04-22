/**
 * Migration: Create recommended_dishes and recommended_dishes_staging tables
 */

exports.up = (pgm) => {
  // ── recommended_dishes ───────────────────────────────────────
  pgm.createTable('recommended_dishes', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    dish_id: { type: 'uuid', notNull: true },
    dish_variant_id: { type: 'uuid', notNull: true },
    display_order: { type: 'integer', notNull: true, default: 1 },
    status: { type: 'varchar(20)', notNull: true, default: "'ACTIVE'" },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    deleted_at: { type: 'timestamptz' },
    is_active: { type: 'boolean', default: true },
  }, { ifNotExists: true });

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE recommended_dishes ADD CONSTRAINT fk_recommended_dishes_dish
        FOREIGN KEY (dish_id) REFERENCES dishes(id)
        ON UPDATE NO ACTION ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE recommended_dishes ADD CONSTRAINT fk_recommended_dishes_variant
        FOREIGN KEY (dish_variant_id) REFERENCES dish_variants(id)
        ON UPDATE NO ACTION ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  pgm.sql(`
    CREATE OR REPLACE TRIGGER update_recommended_dishes_updated_at
      BEFORE UPDATE ON recommended_dishes
      FOR EACH ROW
      EXECUTE FUNCTION update_recommended_dishes_updated_at();
  `);

  // ── recommended_dishes_staging ───────────────────────────────
  pgm.createTable('recommended_dishes_staging', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    dish_staging_id: { type: 'uuid', notNull: true },
    dish_variant_staging_id: { type: 'uuid', notNull: true },
    display_order: { type: 'integer', notNull: true, default: 1 },
    status: { type: 'varchar(20)', notNull: true, default: "'ACTIVE'" },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    deleted_at: { type: 'timestamptz' },
    is_active: { type: 'boolean', default: true },
    recommended_dish_id: { type: 'uuid' },
  }, { ifNotExists: true });

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE recommended_dishes_staging ADD CONSTRAINT fk_recommended_dishes_staging_dish
        FOREIGN KEY (dish_staging_id) REFERENCES dishes_staging(id)
        ON UPDATE NO ACTION ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE recommended_dishes_staging ADD CONSTRAINT fk_recommended_dishes_staging_variant
        FOREIGN KEY (dish_variant_staging_id) REFERENCES dish_variants_staging(id)
        ON UPDATE NO ACTION ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE recommended_dishes_staging ADD CONSTRAINT fk_recommended_dishes_staging_main
        FOREIGN KEY (recommended_dish_id) REFERENCES recommended_dishes(id)
        ON UPDATE NO ACTION ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  pgm.sql(`
    CREATE OR REPLACE TRIGGER update_recommended_dishes_staging_updated_at
      BEFORE UPDATE ON recommended_dishes_staging
      FOR EACH ROW
      EXECUTE FUNCTION update_recommended_dishes_staging_updated_at();
  `);
};

exports.down = (pgm) => {
  pgm.sql(`DROP TRIGGER IF EXISTS update_recommended_dishes_staging_updated_at ON recommended_dishes_staging`);
  pgm.dropTable('recommended_dishes_staging', { ifExists: true, cascade: true });
  pgm.sql(`DROP TRIGGER IF EXISTS update_recommended_dishes_updated_at ON recommended_dishes`);
  pgm.dropTable('recommended_dishes', { ifExists: true, cascade: true });
};
