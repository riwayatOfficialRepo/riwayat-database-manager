exports.up = (pgm) => {
  // Covers: WHERE dish_id = $1 AND deleted_at IS NULL ORDER BY created_at DESC
  // The existing idx_dish_variants_dish_id_id_not_deleted does not include created_at,
  // forcing a post-filter sort. This index eliminates that sort step.
  pgm.sql(`
    CREATE INDEX IF NOT EXISTS idx_dish_variants_dish_id_created_at
      ON dish_variants (dish_id ASC, created_at DESC)
      WHERE deleted_at IS NULL;
  `);
};

exports.down = (pgm) => {
  pgm.sql(`DROP INDEX IF EXISTS idx_dish_variants_dish_id_created_at`);
};
