/**
 * Migration: Create add_ons and add_ons_staging tables
 */

exports.up = (pgm) => {
  // ── trigger functions ────────────────────────────────────────
  pgm.sql(`
    CREATE OR REPLACE FUNCTION update_add_ons_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  pgm.sql(`
    CREATE OR REPLACE FUNCTION update_add_ons_staging_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  // ── add_ons ──────────────────────────────────────────────────
  pgm.createTable('add_ons', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    dish_id: { type: 'uuid', notNull: true },
    name: { type: 'varchar(255)', notNull: true },
    price: { type: 'numeric(10,2)', notNull: true, default: -1 },
    currency: { type: 'varchar(10)', notNull: true, default: "'PKR'" },
    max_quantity: { type: 'integer', notNull: true, default: 1 },
    status: { type: 'varchar(20)', notNull: true, default: "'ACTIVE'" },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    deleted_at: { type: 'timestamptz' },
  }, { ifNotExists: true });

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE add_ons ADD CONSTRAINT fk_add_ons_dish
        FOREIGN KEY (dish_id) REFERENCES dishes(id)
        ON UPDATE NO ACTION ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  pgm.sql(`
    CREATE OR REPLACE TRIGGER update_add_ons_updated_at
      BEFORE UPDATE ON add_ons
      FOR EACH ROW
      EXECUTE FUNCTION update_add_ons_updated_at();
  `);

  // ── add_ons_staging ──────────────────────────────────────────
  pgm.createTable('add_ons_staging', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    dish_staging_id: { type: 'uuid', notNull: true },
    name: { type: 'varchar(255)', notNull: true },
    price: { type: 'numeric(10,2)', notNull: true, default: -1 },
    currency: { type: 'varchar(10)', notNull: true, default: "'PKR'" },
    max_quantity: { type: 'integer', notNull: true, default: 1 },
    status: { type: 'varchar(20)', notNull: true, default: "'ACTIVE'" },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    deleted_at: { type: 'timestamptz' },
    add_on_id: { type: 'uuid' },
  }, { ifNotExists: true });

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE add_ons_staging ADD CONSTRAINT fk_add_ons_staging_dish
        FOREIGN KEY (dish_staging_id) REFERENCES dishes_staging(id)
        ON UPDATE NO ACTION ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE add_ons_staging ADD CONSTRAINT fk_add_ons_staging_add_on_id
        FOREIGN KEY (add_on_id) REFERENCES add_ons(id)
        ON UPDATE NO ACTION ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  pgm.sql(`
    CREATE OR REPLACE TRIGGER update_add_ons_staging_updated_at
      BEFORE UPDATE ON add_ons_staging
      FOR EACH ROW
      EXECUTE FUNCTION update_add_ons_staging_updated_at();
  `);
};

exports.down = (pgm) => {
  pgm.sql(`DROP TRIGGER IF EXISTS update_add_ons_staging_updated_at ON add_ons_staging`);
  pgm.dropTable('add_ons_staging', { ifExists: true, cascade: true });
  pgm.sql(`DROP TRIGGER IF EXISTS update_add_ons_updated_at ON add_ons`);
  pgm.dropTable('add_ons', { ifExists: true, cascade: true });
};
