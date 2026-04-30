exports.up = (pgm) => {
  pgm.sql(`
    ALTER TABLE dish_variants_staging
      ADD COLUMN IF NOT EXISTS status varchar(20) DEFAULT 'DRAFT';
  `);
};

exports.down = (pgm) => {
  pgm.sql(`ALTER TABLE dish_variants_staging DROP COLUMN IF EXISTS status`);
};
