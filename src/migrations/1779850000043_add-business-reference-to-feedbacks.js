exports.up = (pgm) => {
  pgm.sql(`
    ALTER TABLE feedbacks
      ADD COLUMN IF NOT EXISTS business_reference VARCHAR(255)
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    ALTER TABLE feedbacks
      DROP COLUMN IF EXISTS business_reference
  `);
};
