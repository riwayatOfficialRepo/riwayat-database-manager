exports.up = (pgm) => {
  pgm.sql(`
    CREATE INDEX IF NOT EXISTS idx_promotion_target_variants_dish_id_status
      ON promotion_target_variants (promotion_target_dish_id, status)
      WHERE deleted_at IS NULL
  `);
};

exports.down = (pgm) => {
  pgm.sql(`DROP INDEX IF EXISTS idx_promotion_target_variants_dish_id_status`);
};
