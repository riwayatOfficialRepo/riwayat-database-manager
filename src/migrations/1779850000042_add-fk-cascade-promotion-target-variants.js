exports.up = (pgm) => {
  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE promotion_target_variants
        ADD CONSTRAINT fk_promotion_target_variants_dish_id
        FOREIGN KEY (promotion_target_dish_id)
        REFERENCES promotion_target_dishes(id)
        ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    ALTER TABLE promotion_target_variants
      DROP CONSTRAINT IF EXISTS fk_promotion_target_variants_dish_id
  `);
};
