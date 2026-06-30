exports.up = (pgm) => {
  pgm.sql(`
    ALTER TABLE promotion_target_kitchens
      ADD COLUMN IF NOT EXISTS operational_status VARCHAR(50) DEFAULT 'ACTIVE',
      ADD COLUMN IF NOT EXISTS kitchen_detail     JSONB,
      ADD COLUMN IF NOT EXISTS approved_by        UUID,
      ADD COLUMN IF NOT EXISTS rejected_by        UUID
  `);

  pgm.sql(`
    ALTER TABLE promotion_target_dishes
      ADD COLUMN IF NOT EXISTS dish_detail JSONB
  `);

  pgm.sql(`
    ALTER TABLE promotion_target_variants
      ADD COLUMN IF NOT EXISTS variant_detail JSONB
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    ALTER TABLE promotion_target_variants
      DROP COLUMN IF EXISTS variant_detail
  `);

  pgm.sql(`
    ALTER TABLE promotion_target_dishes
      DROP COLUMN IF EXISTS dish_detail
  `);

  pgm.sql(`
    ALTER TABLE promotion_target_kitchens
      DROP COLUMN IF EXISTS rejected_by,
      DROP COLUMN IF EXISTS approved_by,
      DROP COLUMN IF EXISTS kitchen_detail,
      DROP COLUMN IF EXISTS operational_status
  `);
};
