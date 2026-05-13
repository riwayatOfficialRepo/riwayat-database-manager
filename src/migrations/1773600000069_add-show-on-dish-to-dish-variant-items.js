exports.up = (pgm) => {
  pgm.sql(`ALTER TABLE dish_variant_items ADD COLUMN IF NOT EXISTS show_on_dish boolean NOT NULL DEFAULT false`);
  pgm.sql(`ALTER TABLE dish_variant_items_staging ADD COLUMN IF NOT EXISTS show_on_dish boolean NOT NULL DEFAULT false`);
};

exports.down = (pgm) => {
  pgm.sql(`ALTER TABLE dish_variant_items DROP COLUMN IF EXISTS show_on_dish`);
  pgm.sql(`ALTER TABLE dish_variant_items_staging DROP COLUMN IF EXISTS show_on_dish`);
};
