exports.up = (pgm) => {
  pgm.sql(`
    ALTER TABLE prospects
      ADD COLUMN IF NOT EXISTS business_reference VARCHAR(255),
      ADD COLUMN IF NOT EXISTS kitchen_detail     JSONB,
      ADD COLUMN IF NOT EXISTS user_detail        JSONB
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    ALTER TABLE prospects
      DROP COLUMN IF EXISTS business_reference,
      DROP COLUMN IF EXISTS kitchen_detail,
      DROP COLUMN IF EXISTS user_detail
  `);
};
