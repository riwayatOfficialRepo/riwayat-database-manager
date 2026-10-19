exports.up = (pgm) => {
  pgm.sql(`
    ALTER TABLE feedbacks
      ADD COLUMN IF NOT EXISTS rejected_by_details JSONB
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    ALTER TABLE feedbacks
      DROP COLUMN IF EXISTS rejected_by_details
  `);
};
