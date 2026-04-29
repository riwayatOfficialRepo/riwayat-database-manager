/**
 * Migration: Create dish_variants and dish_variants_staging tables
 */

exports.up = (pgm) => {
  // ── dish_variants ────────────────────────────────────────────
  pgm.createTable('dish_variants', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('uuid_generate_v4()') },
    dish_id: { type: 'uuid' },
    title: { type: 'text' },
    description: { type: 'text' },
    unit: { type: 'text' },
    unit_quantity: { type: 'numeric(10,2)' },
    price: { type: 'numeric(10,2)' },
    currency: { type: 'varchar(10)', default: "'PKR'" },
    per_order_limit: { type: 'integer' },
    daily_limit: { type: 'integer' },
    is_active: { type: 'boolean', default: true },
    quantity_available: { type: 'integer' },
    min_order_quantity: { type: 'integer', default: 1 },
    created_at: { type: 'timestamp', default: pgm.func('now()') },
    updated_at: { type: 'timestamp', default: pgm.func('now()') },
    deleted_at: { type: 'timestamp' },
    change_in_progress: { type: 'boolean', default: false },
    standalone_min_order_limit: { type: 'integer' },
    approx_preparation_time: { type: 'integer' },
    preparation_unit: { type: 'varchar(20)', default: "'minutes'" },
    preparation_mode: { type: 'varchar(20)', default: "'ready'" },
    is_negotiable: { type: 'boolean', default: false },
    is_customization_allowed: { type: 'boolean', default: true },
    status: { type: 'varchar(20)', default: "'DRAFT'" },
  }, { ifNotExists: true });

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE dish_variants ADD CONSTRAINT dish_variants_preparation_mode_check
        CHECK (preparation_mode = ANY (ARRAY['ready', 'pre_order']));
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE dish_variants ADD CONSTRAINT dish_variants_preparation_unit_check
        CHECK (preparation_unit = ANY (ARRAY['minutes', 'hours']));
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  pgm.sql(`
    CREATE INDEX IF NOT EXISTS idx_dish_variants_dish_id_id_not_deleted
      ON dish_variants (dish_id ASC, id ASC)
      WHERE deleted_at IS NULL;
  `);

  pgm.sql(`
    CREATE UNIQUE INDEX IF NOT EXISTS uniq_dish_variant_title_idx
      ON dish_variants (dish_id ASC, lower(title) ASC);
  `);

  // ── dish_variants_staging ────────────────────────────────────
  pgm.createTable('dish_variants_staging', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('uuid_generate_v4()') },
    dish_variant_id: { type: 'uuid' },
    dish_staging_id: { type: 'uuid' },
    title: { type: 'text' },
    description: { type: 'text' },
    unit: { type: 'text' },
    unit_quantity: { type: 'numeric(10,2)' },
    price: { type: 'numeric(10,2)' },
    currency: { type: 'varchar(10)', default: "'PKR'" },
    per_order_limit: { type: 'integer' },
    daily_limit: { type: 'integer' },
    is_active: { type: 'boolean', default: true },
    quantity_available: { type: 'integer' },
    min_order_quantity: { type: 'integer', default: 1 },
    status: { type: 'varchar(20)', default: "'DRAFT'" },
    created_at: { type: 'timestamp', default: pgm.func('now()') },
    updated_at: { type: 'timestamp', default: pgm.func('now()') },
    deleted_at: { type: 'timestamp' },
    change_in_progress: { type: 'boolean', default: false },
    standalone_min_order_limit: { type: 'integer' },
    approx_preparation_time: { type: 'integer' },
    preparation_unit: { type: 'varchar(20)', default: "'minutes'" },
    preparation_mode: { type: 'varchar(20)', default: "'ready'" },
    is_negotiable: { type: 'boolean', default: false },
    is_customization_allowed: { type: 'boolean', default: true },
  }, { ifNotExists: true });

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE dish_variants_staging ADD CONSTRAINT dish_variants_staging_dish_variant_id_fkey
        FOREIGN KEY (dish_variant_id) REFERENCES dish_variants(id)
        ON UPDATE NO ACTION ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE dish_variants_staging ADD CONSTRAINT dish_variants_staging_preparation_mode_check
        CHECK (preparation_mode = ANY (ARRAY['ready', 'pre_order']));
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE dish_variants_staging ADD CONSTRAINT dish_variants_staging_preparation_unit_check
        CHECK (preparation_unit = ANY (ARRAY['minutes', 'hours', 'days']));
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  pgm.sql(`
    CREATE INDEX IF NOT EXISTS idx_dish_variants_staging_dish_id_not_deleted
      ON dish_variants_staging (dish_staging_id ASC)
      WHERE deleted_at IS NULL;
  `);

  pgm.sql(`
    CREATE UNIQUE INDEX IF NOT EXISTS uniq_dish_variant_staging_title_idx
      ON dish_variants_staging (dish_staging_id ASC, lower(title) ASC);
  `);
};

exports.down = (pgm) => {
  pgm.dropTable('dish_variants_staging', { ifExists: true, cascade: true });
  pgm.dropTable('dish_variants', { ifExists: true, cascade: true });
};
