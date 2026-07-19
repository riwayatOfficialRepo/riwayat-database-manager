exports.up = (pgm) => {
  pgm.sql(`
    ALTER TABLE feedbacks
      ADD COLUMN IF NOT EXISTS sent_to_kitchen_detail        JSONB,
      ADD COLUMN IF NOT EXISTS extension_requested_by_detail JSONB
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    ALTER TABLE feedbacks
      DROP COLUMN IF EXISTS sent_to_kitchen_detail,
      DROP COLUMN IF EXISTS extension_requested_by_detail
  `);
};
