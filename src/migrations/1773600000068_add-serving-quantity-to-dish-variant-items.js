exports.up = (pgm) => {
  pgm.sql(`ALTER TABLE dish_variant_items ADD COLUMN IF NOT EXISTS serving_quantity numeric(10,2)`);
  pgm.sql(`ALTER TABLE dish_variant_items_staging ADD COLUMN IF NOT EXISTS serving_quantity numeric(10,2)`);
};

exports.down = (pgm) => {
  pgm.sql(`ALTER TABLE dish_variant_items DROP COLUMN IF EXISTS serving_quantity`);
  pgm.sql(`ALTER TABLE dish_variant_items_staging DROP COLUMN IF EXISTS serving_quantity`);
};
