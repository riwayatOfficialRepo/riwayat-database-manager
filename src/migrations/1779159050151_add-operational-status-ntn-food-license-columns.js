exports.up = (pgm) => {
  // operational_status — kitchens, dishes, dish_variants
  pgm.sql(`ALTER TABLE kitchens ADD COLUMN IF NOT EXISTS operational_status varchar(30)`);
  pgm.sql(`ALTER TABLE dishes ADD COLUMN IF NOT EXISTS operational_status varchar(30)`);
  pgm.sql(`ALTER TABLE dish_variants ADD COLUMN IF NOT EXISTS operational_status varchar(30)`);

  // ntn — kitchen_users (National Tax Number)
  pgm.sql(`ALTER TABLE kitchen_users ADD COLUMN IF NOT EXISTS ntn varchar(50)`);

  // has_food_liscense flag — kitchens and kitchens_staging
  pgm.sql(`ALTER TABLE kitchens ADD COLUMN IF NOT EXISTS has_food_liscense boolean DEFAULT false`);
  pgm.sql(`ALTER TABLE kitchens_staging ADD COLUMN IF NOT EXISTS has_food_liscense boolean DEFAULT false`);
};

exports.down = (pgm) => {
  pgm.sql(`ALTER TABLE kitchens DROP COLUMN IF EXISTS operational_status`);
  pgm.sql(`ALTER TABLE dishes DROP COLUMN IF EXISTS operational_status`);
  pgm.sql(`ALTER TABLE dish_variants DROP COLUMN IF EXISTS operational_status`);

  pgm.sql(`ALTER TABLE kitchen_users DROP COLUMN IF EXISTS ntn`);

  pgm.sql(`ALTER TABLE kitchens DROP COLUMN IF EXISTS has_food_liscense`);
  pgm.sql(`ALTER TABLE kitchens_staging DROP COLUMN IF EXISTS has_food_liscense`);
};
