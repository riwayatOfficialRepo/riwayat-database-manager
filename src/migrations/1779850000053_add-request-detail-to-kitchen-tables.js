exports.up = (pgm) => {
  const tables = [
    'kitchens',
    'kitchens_staging',
    'kitchen_addresses',
    'kitchen_addresses_staging',
    'kitchen_availability',
    'kitchen_availability_staging',
    'kitchen_chef_stories',
    'kitchen_user_docs',
  ];

  for (const table of tables) {
    pgm.sql(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS request_detail JSONB`);
  }
};

exports.down = (pgm) => {
  const tables = [
    'kitchens',
    'kitchens_staging',
    'kitchen_addresses',
    'kitchen_addresses_staging',
    'kitchen_availability',
    'kitchen_availability_staging',
    'kitchen_chef_stories',
    'kitchen_user_docs',
  ];

  for (const table of tables) {
    pgm.sql(`ALTER TABLE ${table} DROP COLUMN IF EXISTS request_detail`);
  }
};
