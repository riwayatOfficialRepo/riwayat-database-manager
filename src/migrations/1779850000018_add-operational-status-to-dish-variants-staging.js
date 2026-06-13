exports.up = (pgm) => {
  pgm.sql(`ALTER TABLE dish_variants_staging ADD COLUMN IF NOT EXISTS operational_status varchar(30)`);
};

exports.down = (pgm) => {
  pgm.sql(`ALTER TABLE dish_variants_staging DROP COLUMN IF EXISTS operational_status`);
};
