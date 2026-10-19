exports.up = (pgm) => {
  const tables = [
    'kitchens',
    'kitchens_staging',
    'dishes',
    'dishes_staging',
    'dish_variants',
    'dish_variants_staging',
    'promotions',
    'promotions_staging',
    'promotion_target_kitchens',
    'promotion_target_dishes',
    'promotion_target_variants',
  ];

  for (const table of tables) {
    pgm.sql(`ALTER TABLE ${table} ALTER COLUMN operational_status SET DEFAULT 'PENDING'`);
  }
};

exports.down = (pgm) => {
  pgm.sql(`ALTER TABLE promotion_target_variants  ALTER COLUMN operational_status SET DEFAULT 'DRAFT'`);
  pgm.sql(`ALTER TABLE promotion_target_dishes    ALTER COLUMN operational_status SET DEFAULT 'DRAFT'`);
  pgm.sql(`ALTER TABLE promotion_target_kitchens  ALTER COLUMN operational_status SET DEFAULT 'ACTIVE'`);
  pgm.sql(`ALTER TABLE promotions_staging         ALTER COLUMN operational_status DROP DEFAULT`);
  pgm.sql(`ALTER TABLE promotions                 ALTER COLUMN operational_status DROP DEFAULT`);
  pgm.sql(`ALTER TABLE dish_variants_staging      ALTER COLUMN operational_status DROP DEFAULT`);
  pgm.sql(`ALTER TABLE dish_variants              ALTER COLUMN operational_status DROP DEFAULT`);
  pgm.sql(`ALTER TABLE dishes_staging             ALTER COLUMN operational_status DROP DEFAULT`);
  pgm.sql(`ALTER TABLE dishes                     ALTER COLUMN operational_status DROP DEFAULT`);
  pgm.sql(`ALTER TABLE kitchens_staging           ALTER COLUMN operational_status DROP DEFAULT`);
  pgm.sql(`ALTER TABLE kitchens                   ALTER COLUMN operational_status DROP DEFAULT`);
};
