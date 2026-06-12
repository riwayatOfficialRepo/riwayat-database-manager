exports.up = (pgm) => {
  // ── trigger functions ────────────────────────────────────────
  pgm.sql(`
    CREATE OR REPLACE FUNCTION update_promotion_targets_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  pgm.sql(`
    CREATE OR REPLACE FUNCTION update_promotion_target_variants_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  // ── promotion_targets ────────────────────────────────────────
  pgm.createTable(
    'promotion_targets',
    {
      id: {
        type: 'uuid',
        primaryKey: true,
        default: pgm.func('gen_random_uuid()'),
        notNull: true,
      },
      promotion_id:        { type: 'uuid',       notNull: true },
      scope_type:          { type: 'varchar',     notNull: true },
      include_side_dishes: { type: 'boolean',     notNull: true, default: false },
      status:              { type: 'varchar',     notNull: true, default: "'processing'" },
      input_json:          { type: 'jsonb' },
      created_at:          { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
      updated_at:          { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
      deleted_at:          { type: 'timestamptz' },
    },
    { ifNotExists: true },
  );

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE promotion_targets
        ADD CONSTRAINT promotion_targets_promotion_id_fkey
        FOREIGN KEY (promotion_id) REFERENCES promotions(id)
        ON UPDATE NO ACTION ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL;
    END $$;
  `);

  pgm.sql(`
    CREATE OR REPLACE TRIGGER trg_update_promotion_targets
      BEFORE UPDATE ON promotion_targets
      FOR EACH ROW
      EXECUTE FUNCTION update_promotion_targets_updated_at();
  `);

  // ── promotion_target_variants ────────────────────────────────
  pgm.createTable(
    'promotion_target_variants',
    {
      id: {
        type: 'uuid',
        primaryKey: true,
        default: pgm.func('gen_random_uuid()'),
        notNull: true,
      },
      promotion_target_dish_id: { type: 'uuid',       notNull: true },
      variant_id:               { type: 'uuid',       notNull: true },
      status:                   { type: 'varchar',    notNull: true, default: "'active'" },
      created_at:               { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
      updated_at:               { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
      deleted_at:               { type: 'timestamptz' },
    },
    { ifNotExists: true },
  );

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE promotion_target_variants
        ADD CONSTRAINT promotion_target_variants_promotion_target_dish_id_fkey
        FOREIGN KEY (promotion_target_dish_id) REFERENCES promotion_target_dishes(id)
        ON UPDATE NO ACTION ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL;
    END $$;
  `);

  pgm.sql(`
    CREATE OR REPLACE TRIGGER trg_update_promotion_target_variants
      BEFORE UPDATE ON promotion_target_variants
      FOR EACH ROW
      EXECUTE FUNCTION update_promotion_target_variants_updated_at();
  `);
};

exports.down = (pgm) => {
  pgm.sql(`DROP TRIGGER IF EXISTS trg_update_promotion_target_variants ON promotion_target_variants`);
  pgm.dropTable('promotion_target_variants', { ifExists: true, cascade: true });
  pgm.sql(`DROP FUNCTION IF EXISTS update_promotion_target_variants_updated_at()`);

  pgm.sql(`DROP TRIGGER IF EXISTS trg_update_promotion_targets ON promotion_targets`);
  pgm.dropTable('promotion_targets', { ifExists: true, cascade: true });
  pgm.sql(`DROP FUNCTION IF EXISTS update_promotion_targets_updated_at()`);
};
