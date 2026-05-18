exports.up = (pgm) => {
  pgm.sql(`ALTER TABLE add_ons ADD COLUMN IF NOT EXISTS show_on_dish boolean NOT NULL DEFAULT false`);
  pgm.sql(`ALTER TABLE add_ons_staging ADD COLUMN IF NOT EXISTS show_on_dish boolean NOT NULL DEFAULT false`);
};

exports.down = (pgm) => {
  pgm.sql(`ALTER TABLE add_ons DROP COLUMN IF EXISTS show_on_dish`);
  pgm.sql(`ALTER TABLE add_ons_staging DROP COLUMN IF EXISTS show_on_dish`);
};
