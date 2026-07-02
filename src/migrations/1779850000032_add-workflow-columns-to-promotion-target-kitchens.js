exports.up = (pgm) => {
  pgm.sql(`
    ALTER TABLE promotion_target_kitchens
      ADD COLUMN IF NOT EXISTS submitted_at     TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS submitted_detail JSONB,
      ADD COLUMN IF NOT EXISTS approved_detail  JSONB,
      ADD COLUMN IF NOT EXISTS rejected_detail  JSONB
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    ALTER TABLE promotion_target_kitchens
      DROP COLUMN IF EXISTS submitted_at,
      DROP COLUMN IF EXISTS submitted_detail,
      DROP COLUMN IF EXISTS approved_detail,
      DROP COLUMN IF EXISTS rejected_detail
  `);
};
