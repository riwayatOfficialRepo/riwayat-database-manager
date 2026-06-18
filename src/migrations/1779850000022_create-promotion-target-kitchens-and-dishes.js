exports.up = (pgm) => {
  pgm.sql(`
    CREATE OR REPLACE FUNCTION update_promotion_target_kitchens_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN NEW.updated_at = now(); RETURN NEW; END;
    $$ LANGUAGE plpgsql;
  `);

  pgm.sql(`
    CREATE OR REPLACE FUNCTION update_promotion_target_dishes_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN NEW.updated_at = now(); RETURN NEW; END;
    $$ LANGUAGE plpgsql;
  `);

  // ── promotion_target_kitchens ────────────────────────────────
  pgm.createTable('promotion_target_kitchens', {
    id:                  { type: 'uuid',        primaryKey: true, default: pgm.func('gen_random_uuid()'), notNull: true },
    promotion_target_id: { type: 'uuid',        notNull: true },
    kitchen_id:          { type: 'uuid',        notNull: true },
    apply_to_all_dishes: { type: 'boolean',     notNull: true, default: true },
    operational_status:  { type: 'varchar(30)', notNull: true, default: "'DRAFT'" },
    status:              { type: 'varchar',     notNull: true, default: "'draft'" },
    created_at:          { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at:          { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    deleted_at:          { type: 'timestamptz' },
  }, { ifNotExists: true });

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE promotion_target_kitchens
        ADD CONSTRAINT promotion_target_kitchens_promotion_target_id_fkey
        FOREIGN KEY (promotion_target_id) REFERENCES promotion_targets(id) ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;
  `);

  pgm.sql(`
    CREATE OR REPLACE TRIGGER trg_update_promotion_target_kitchens
      BEFORE UPDATE ON promotion_target_kitchens FOR EACH ROW
      EXECUTE FUNCTION update_promotion_target_kitchens_updated_at();
  `);

  // ── promotion_target_dishes ──────────────────────────────────
  pgm.createTable('promotion_target_dishes', {
    id:                          { type: 'uuid',        primaryKey: true, default: pgm.func('gen_random_uuid()'), notNull: true },
    promotion_target_kitchen_id: { type: 'uuid',        notNull: true },
    dish_id:                     { type: 'uuid',        notNull: true },
    apply_to_all_variants:       { type: 'boolean',     notNull: true, default: true },
    operational_status:          { type: 'varchar(30)', notNull: true, default: "'DRAFT'" },
    status:                      { type: 'varchar',     notNull: true, default: "'active'" },
    created_at:                  { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at:                  { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    deleted_at:                  { type: 'timestamptz' },
  }, { ifNotExists: true });

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE promotion_target_dishes
        ADD CONSTRAINT promotion_target_dishes_promotion_target_kitchen_id_fkey
        FOREIGN KEY (promotion_target_kitchen_id) REFERENCES promotion_target_kitchens(id) ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;
  `);

  pgm.sql(`
    CREATE OR REPLACE TRIGGER trg_update_promotion_target_dishes
      BEFORE UPDATE ON promotion_target_dishes FOR EACH ROW
      EXECUTE FUNCTION update_promotion_target_dishes_updated_at();
  `);
};

exports.down = (pgm) => {
  pgm.sql(`DROP TRIGGER IF EXISTS trg_update_promotion_target_dishes ON promotion_target_dishes`);
  pgm.dropTable('promotion_target_dishes', { ifExists: true, cascade: true });
  pgm.sql(`DROP FUNCTION IF EXISTS update_promotion_target_dishes_updated_at()`);

  pgm.sql(`DROP TRIGGER IF EXISTS trg_update_promotion_target_kitchens ON promotion_target_kitchens`);
  pgm.dropTable('promotion_target_kitchens', { ifExists: true, cascade: true });
  pgm.sql(`DROP FUNCTION IF EXISTS update_promotion_target_kitchens_updated_at()`);
};
