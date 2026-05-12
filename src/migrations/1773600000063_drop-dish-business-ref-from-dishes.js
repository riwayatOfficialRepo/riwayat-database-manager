exports.up = (pgm) => {
  pgm.sql(`ALTER TABLE dishes DROP COLUMN IF EXISTS dish_business_ref`);
  pgm.sql(`ALTER TABLE dishes_staging DROP COLUMN IF EXISTS dish_business_ref`);
};

exports.down = (pgm) => {
  pgm.sql(`ALTER TABLE dishes ADD COLUMN IF NOT EXISTS dish_business_ref varchar(255) NULL`);
  pgm.sql(`ALTER TABLE dishes_staging ADD COLUMN IF NOT EXISTS dish_business_ref varchar(255) NULL`);
};
