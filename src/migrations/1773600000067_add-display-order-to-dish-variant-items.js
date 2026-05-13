exports.up = (pgm) => {
  pgm.sql(`ALTER TABLE dish_variant_items ADD COLUMN IF NOT EXISTS display_order integer`);
  pgm.sql(`ALTER TABLE dish_variant_items_staging ADD COLUMN IF NOT EXISTS display_order integer`);
};

exports.down = (pgm) => {
  pgm.sql(`ALTER TABLE dish_variant_items DROP COLUMN IF EXISTS display_order`);
  pgm.sql(`ALTER TABLE dish_variant_items_staging DROP COLUMN IF EXISTS display_order`);
};
