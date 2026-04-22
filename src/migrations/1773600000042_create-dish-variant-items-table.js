/**
 * Migration: Create dish_variant_items and dish_variant_items_staging tables
 */

exports.up = (pgm) => {
  // ── dish_variant_items ───────────────────────────────────────
  pgm.createTable('dish_variant_items', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('uuid_generate_v4()') },
    variant_id: { type: 'uuid', notNull: true },
    name: { type: 'text' },
    description: { type: 'text' },
    status: { type: 'varchar(20)', default: "'ACTIVE'" },
    created_at: { type: 'timestamp', default: pgm.func('now()') },
    updated_at: { type: 'timestamp', default: pgm.func('now()') },
    deleted_at: { type: 'timestamp' },
    change_in_progress: { type: 'boolean', default: false },
  }, { ifNotExists: true });

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE dish_variant_items ADD CONSTRAINT fk_dish_variant_items_variant
        FOREIGN KEY (variant_id) REFERENCES dish_variants(id)
        ON UPDATE CASCADE ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  // ── dish_variant_items_staging ───────────────────────────────
  pgm.createTable('dish_variant_items_staging', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('uuid_generate_v4()') },
    dish_staging_id: { type: 'uuid', notNull: true },
    variant_staging_id: { type: 'uuid', notNull: true },
    name: { type: 'text', notNull: true },
    description: { type: 'text' },
    status: { type: 'varchar(20)', default: "'DRAFT'" },
    created_at: { type: 'timestamp', default: pgm.func('now()') },
    updated_at: { type: 'timestamp', default: pgm.func('now()') },
    deleted_at: { type: 'timestamp' },
    dish_variant_item_id: { type: 'uuid' },
    change_in_progress: { type: 'boolean', default: false },
  }, { ifNotExists: true });

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE dish_variant_items_staging ADD CONSTRAINT fk_dish_variant_items_staging_item
        FOREIGN KEY (dish_variant_item_id) REFERENCES dish_variant_items(id)
        ON UPDATE CASCADE ON DELETE SET NULL;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE dish_variant_items_staging ADD CONSTRAINT fk_dish_variant_items_staging_variant_staging
        FOREIGN KEY (variant_staging_id) REFERENCES dish_variants_staging(id)
        ON UPDATE CASCADE ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);
};

exports.down = (pgm) => {
  pgm.dropTable('dish_variant_items_staging', { ifExists: true, cascade: true });
  pgm.dropTable('dish_variant_items', { ifExists: true, cascade: true });
};
