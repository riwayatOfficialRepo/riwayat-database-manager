exports.up = (pgm) => {
  const tables = [
    'dish_cuisine_map',
    'dish_cuisine_map_staging',
    'dish_tag_map',
    'dish_tag_map_staging',
    'dish_dietary_map',
    'dish_dietary_map_staging',
  ];

  for (const table of tables) {
    pgm.sql(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT now()`);
  }
};

exports.down = (pgm) => {
  const tables = [
    'dish_cuisine_map',
    'dish_cuisine_map_staging',
    'dish_tag_map',
    'dish_tag_map_staging',
    'dish_dietary_map',
    'dish_dietary_map_staging',
  ];

  for (const table of tables) {
    pgm.sql(`ALTER TABLE ${table} DROP COLUMN IF EXISTS updated_at`);
  }
};
