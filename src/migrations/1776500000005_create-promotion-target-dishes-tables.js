/**
 * Migration: Create promotion_target_dishes and promotion_target_dishes_staging tables
 */

exports.up = (pgm) => {
  // ── trigger functions ────────────────────────────────────────
  pgm.sql(`
    CREATE OR REPLACE FUNCTION update_promotion_target_dishes_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  pgm.sql(`
    CREATE OR REPLACE FUNCTION update_promotion_target_dishes_staging_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  // ── promotion_target_dishes ──────────────────────────────────
  pgm.createTable(
    'promotion_target_dishes',
    {
      id: {
        type: 'uuid',
        primaryKey: true,
        default: pgm.func('gen_random_uuid()'),
        notNull: true,
      },
      promotion_target_kitchen_id: { type: 'uuid', notNull: true },
      item_id: { type: 'uuid' },
      status: { type: 'varchar(50)', default: "'DRAFT'" },
      created_at: { type: 'timestamptz', default: pgm.func('now()') },
      updated_at: { type: 'timestamptz', default: pgm.func('now()') },
      deleted_at: { type: 'timestamptz' },
    },
    { ifNotExists: true },
  );

  // FK: promotion_target_kitchen_id -> promotion_target_kitchens
  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE promotion_target_dishes
        ADD CONSTRAINT promotion_target_dishes_promotion_target_kitchen_id_fkey
        FOREIGN KEY (promotion_target_kitchen_id) REFERENCES promotion_target_kitchens(id)
        ON UPDATE NO ACTION ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  pgm.sql(`
    CREATE OR REPLACE TRIGGER trg_update_promotion_target_dishes
      BEFORE UPDATE ON promotion_target_dishes
      FOR EACH ROW
      EXECUTE FUNCTION update_promotion_target_dishes_updated_at();
  `);

  // ── promotion_target_dishes_staging ──────────────────────────
  pgm.createTable(
    'promotion_target_dishes_staging',
    {
      id: {
        type: 'uuid',
        primaryKey: true,
        default: pgm.func('gen_random_uuid()'),
        notNull: true,
      },
      promotion_target_kitchen_staging_id: { type: 'uuid', notNull: true },
      promotion_target_dish_id: { type: 'uuid' },
      item_id: { type: 'uuid', notNull: true },
      status: { type: 'varchar(50)', default: "'DRAFT'" },
      created_at: { type: 'timestamptz', default: pgm.func('now()') },
      updated_at: { type: 'timestamptz', default: pgm.func('now()') },
      deleted_at: { type: 'timestamptz' },
    },
    { ifNotExists: true },
  );

  // FK: promotion_target_kitchen_staging_id -> promotion_target_kitchens_staging
  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE promotion_target_dishes_staging
        ADD CONSTRAINT promotion_target_dishes_staging_kitchen_staging_id_fkey
        FOREIGN KEY (promotion_target_kitchen_staging_id) REFERENCES promotion_target_kitchens_staging(id)
        ON UPDATE NO ACTION ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  // FK: promotion_target_dish_id -> promotion_target_dishes
  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE promotion_target_dishes_staging
        ADD CONSTRAINT fk_promotion_target_dish
        FOREIGN KEY (promotion_target_dish_id) REFERENCES promotion_target_dishes(id)
        ON UPDATE NO ACTION ON DELETE NO ACTION;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  pgm.sql(`
    CREATE OR REPLACE TRIGGER trg_update_promotion_target_dishes_staging
      BEFORE UPDATE ON promotion_target_dishes_staging
      FOR EACH ROW
      EXECUTE FUNCTION update_promotion_target_dishes_staging_updated_at();
  `);
};

exports.down = (pgm) => {
  pgm.sql(`DROP TRIGGER IF EXISTS trg_update_promotion_target_dishes_staging ON promotion_target_dishes_staging`);
  pgm.dropTable('promotion_target_dishes_staging', { ifExists: true, cascade: true });
  pgm.sql(`DROP TRIGGER IF EXISTS trg_update_promotion_target_dishes ON promotion_target_dishes`);
  pgm.dropTable('promotion_target_dishes', { ifExists: true, cascade: true });
  pgm.sql(`DROP FUNCTION IF EXISTS update_promotion_target_dishes_staging_updated_at()`);
  pgm.sql(`DROP FUNCTION IF EXISTS update_promotion_target_dishes_updated_at()`);
};
