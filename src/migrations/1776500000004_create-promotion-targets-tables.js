/**
 * Migration: Create promotion_target_kitchens and promotion_target_kitchens_staging tables
 */

exports.up = (pgm) => {
  // ── trigger functions ────────────────────────────────────────
  pgm.sql(`
    CREATE OR REPLACE FUNCTION update_promotion_target_kitchens_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  pgm.sql(`
    CREATE OR REPLACE FUNCTION update_promotion_target_kitchens_staging_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  // ── promotion_target_kitchens ────────────────────────────────
  pgm.createTable(
    'promotion_target_kitchens',
    {
      id: {
        type: 'uuid',
        primaryKey: true,
        default: pgm.func('gen_random_uuid()'),
        notNull: true,
      },
      promotion_id: { type: 'uuid', notNull: true },
      target_type: { type: 'varchar(20)', notNull: true },
      target_id: { type: 'uuid' },
      side_on: { type: 'boolean', notNull: true, default: false },
      apply_to_all_dishes: { type: 'boolean', default: false },
      status: { type: 'varchar(50)', default: "'DRAFT'" },
      created_at: { type: 'timestamptz', default: pgm.func('now()') },
      updated_at: { type: 'timestamptz', default: pgm.func('now()') },
      deleted_at: { type: 'timestamptz' },
    },
    { ifNotExists: true },
  );

  // FK: promotion_id -> promotions
  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE promotion_target_kitchens
        ADD CONSTRAINT promotion_target_kitchens_promotion_id_fkey
        FOREIGN KEY (promotion_id) REFERENCES promotions(id)
        ON UPDATE NO ACTION ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  // Check: target_type
  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE promotion_target_kitchens
        ADD CONSTRAINT promotion_target_kitchens_target_type_check
        CHECK (target_type IN ('KITCHEN', 'CHEF', 'DISH', 'CATEGORY'));
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  pgm.sql(`
    CREATE OR REPLACE TRIGGER trg_update_promotion_target_kitchens
      BEFORE UPDATE ON promotion_target_kitchens
      FOR EACH ROW
      EXECUTE FUNCTION update_promotion_target_kitchens_updated_at();
  `);

  // ── promotion_target_kitchens_staging ────────────────────────
  pgm.createTable(
    'promotion_target_kitchens_staging',
    {
      id: {
        type: 'uuid',
        primaryKey: true,
        default: pgm.func('gen_random_uuid()'),
        notNull: true,
      },
      promotion_id: { type: 'uuid', notNull: true },
      promotion_target_kitchen_id: { type: 'uuid' },
      target_type: { type: 'varchar(20)', notNull: true },
      target_id: { type: 'uuid' },
      side_on: { type: 'boolean', notNull: true, default: false },
      apply_to_all_dishes: { type: 'boolean', default: false },
      status: { type: 'varchar(50)', default: "'DRAFT'" },
      created_at: { type: 'timestamptz', default: pgm.func('now()') },
      updated_at: { type: 'timestamptz', default: pgm.func('now()') },
      deleted_at: { type: 'timestamptz' },
    },
    { ifNotExists: true },
  );

  // FK: promotion_id -> promotions
  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE promotion_target_kitchens_staging
        ADD CONSTRAINT promotion_target_kitchens_staging_promotion_id_fkey
        FOREIGN KEY (promotion_id) REFERENCES promotions(id)
        ON UPDATE NO ACTION ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  // FK: promotion_target_kitchen_id -> promotion_target_kitchens
  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE promotion_target_kitchens_staging
        ADD CONSTRAINT fk_promotion_target_kitchen
        FOREIGN KEY (promotion_target_kitchen_id) REFERENCES promotion_target_kitchens(id)
        ON UPDATE NO ACTION ON DELETE NO ACTION;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  // Check: target_type
  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE promotion_target_kitchens_staging
        ADD CONSTRAINT promotion_target_kitchens_staging_target_type_check
        CHECK (target_type IN ('KITCHEN', 'CHEF', 'DISH', 'CATEGORY'));
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  pgm.sql(`
    CREATE OR REPLACE TRIGGER trg_update_promotion_target_kitchens_staging
      BEFORE UPDATE ON promotion_target_kitchens_staging
      FOR EACH ROW
      EXECUTE FUNCTION update_promotion_target_kitchens_staging_updated_at();
  `);
};

exports.down = (pgm) => {
  pgm.sql(`DROP TRIGGER IF EXISTS trg_update_promotion_target_kitchens_staging ON promotion_target_kitchens_staging`);
  pgm.dropTable('promotion_target_kitchens_staging', { ifExists: true, cascade: true });
  pgm.sql(`DROP TRIGGER IF EXISTS trg_update_promotion_target_kitchens ON promotion_target_kitchens`);
  pgm.dropTable('promotion_target_kitchens', { ifExists: true, cascade: true });
  pgm.sql(`DROP FUNCTION IF EXISTS update_promotion_target_kitchens_staging_updated_at()`);
  pgm.sql(`DROP FUNCTION IF EXISTS update_promotion_target_kitchens_updated_at()`);
};
