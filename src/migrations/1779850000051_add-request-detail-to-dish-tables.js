exports.up = (pgm) => {
  const tables = [
    'dishes',
    'dishes_staging',
    'dish_variants',
    'dish_variants_staging',
    'dish_availability',
    'dish_availability_staging',
    'dish_special_events',
    'dish_special_events_staging',
    'dish_variant_items',
    'dish_variant_items_staging',
    'modifiers',
    'modifiers_staging',
    'add_ons',
    'add_ons_staging',
    'recommended_dishes',
    'recommended_dishes_staging',
  ];

  for (const table of tables) {
    pgm.sql(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS request_detail JSONB`);
  }
};

exports.down = (pgm) => {
  const tables = [
    'dishes',
    'dishes_staging',
    'dish_variants',
    'dish_variants_staging',
    'dish_availability',
    'dish_availability_staging',
    'dish_special_events',
    'dish_special_events_staging',
    'dish_variant_items',
    'dish_variant_items_staging',
    'modifiers',
    'modifiers_staging',
    'add_ons',
    'add_ons_staging',
    'recommended_dishes',
    'recommended_dishes_staging',
  ];

  for (const table of tables) {
    pgm.sql(`ALTER TABLE ${table} DROP COLUMN IF EXISTS request_detail`);
  }
};
