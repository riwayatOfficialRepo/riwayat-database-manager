exports.up = (pgm) => {
  pgm.sql(`
    ALTER TABLE feedbacks
      ADD COLUMN IF NOT EXISTS feedback_business_reference VARCHAR(50);
  `);
};

exports.down = (pgm) => {
  pgm.dropColumn('feedbacks', 'feedback_business_reference', { ifExists: true });
};
