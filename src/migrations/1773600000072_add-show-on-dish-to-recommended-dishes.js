exports.up = (pgm) => {
  pgm.sql(`ALTER TABLE recommended_dishes ADD COLUMN IF NOT EXISTS show_on_dish boolean NOT NULL DEFAULT false`);
  pgm.sql(`ALTER TABLE recommended_dishes_staging ADD COLUMN IF NOT EXISTS show_on_dish boolean NOT NULL DEFAULT false`);
};

exports.down = (pgm) => {
  pgm.sql(`ALTER TABLE recommended_dishes DROP COLUMN IF EXISTS show_on_dish`);
  pgm.sql(`ALTER TABLE recommended_dishes_staging DROP COLUMN IF EXISTS show_on_dish`);
};
