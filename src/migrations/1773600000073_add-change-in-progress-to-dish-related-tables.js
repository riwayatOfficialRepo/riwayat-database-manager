exports.up = (pgm) => {
  pgm.sql(`ALTER TABLE add_ons ADD COLUMN IF NOT EXISTS change_in_progress boolean NOT NULL DEFAULT false`);
  pgm.sql(`ALTER TABLE add_ons_staging ADD COLUMN IF NOT EXISTS change_in_progress boolean NOT NULL DEFAULT false`);

  pgm.sql(`ALTER TABLE recommended_dishes ADD COLUMN IF NOT EXISTS change_in_progress boolean NOT NULL DEFAULT false`);
  pgm.sql(`ALTER TABLE recommended_dishes_staging ADD COLUMN IF NOT EXISTS change_in_progress boolean NOT NULL DEFAULT false`);

  pgm.sql(`ALTER TABLE dish_availability ADD COLUMN IF NOT EXISTS change_in_progress boolean NOT NULL DEFAULT false`);
  pgm.sql(`ALTER TABLE dish_availability_staging ADD COLUMN IF NOT EXISTS change_in_progress boolean NOT NULL DEFAULT false`);
};

exports.down = (pgm) => {
  pgm.sql(`ALTER TABLE add_ons DROP COLUMN IF EXISTS change_in_progress`);
  pgm.sql(`ALTER TABLE add_ons_staging DROP COLUMN IF EXISTS change_in_progress`);

  pgm.sql(`ALTER TABLE recommended_dishes DROP COLUMN IF EXISTS change_in_progress`);
  pgm.sql(`ALTER TABLE recommended_dishes_staging DROP COLUMN IF EXISTS change_in_progress`);

  pgm.sql(`ALTER TABLE dish_availability DROP COLUMN IF EXISTS change_in_progress`);
  pgm.sql(`ALTER TABLE dish_availability_staging DROP COLUMN IF EXISTS change_in_progress`);
};
