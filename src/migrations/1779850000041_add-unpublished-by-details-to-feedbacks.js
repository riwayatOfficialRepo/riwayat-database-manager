exports.up = (pgm) => {
  pgm.sql(`
    ALTER TABLE feedbacks
      ADD COLUMN IF NOT EXISTS unpublished_by_details JSONB
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    ALTER TABLE feedbacks
      DROP COLUMN IF EXISTS unpublished_by_details
  `);
};
