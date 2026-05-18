exports.up = (pgm) => {
  pgm.sql(`
    ALTER TABLE dish_variants
      ADD COLUMN IF NOT EXISTS business_reference varchar(255) NULL;
  `);

  pgm.sql(`
    ALTER TABLE dish_variants_staging
      ADD COLUMN IF NOT EXISTS business_reference varchar(255) NULL;
  `);
};

exports.down = (pgm) => {
  pgm.sql(`ALTER TABLE dish_variants DROP COLUMN IF EXISTS business_reference`);
  pgm.sql(`ALTER TABLE dish_variants_staging DROP COLUMN IF EXISTS business_reference`);
};
