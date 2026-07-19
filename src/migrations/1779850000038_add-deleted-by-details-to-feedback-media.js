exports.up = (pgm) => {
  pgm.sql(`
    ALTER TABLE feedback_media
      ADD COLUMN IF NOT EXISTS deleted_by_details JSONB
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    ALTER TABLE feedback_media
      DROP COLUMN IF EXISTS deleted_by_details
  `);
};
