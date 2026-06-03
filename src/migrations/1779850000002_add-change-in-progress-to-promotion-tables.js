exports.up = (pgm) => {
  const tables = [
    'promotion_eligibility',
    'promotion_eligibility_staging',
    'promotion_target_kitchens',
    'promotion_target_kitchens_staging',
    'promotion_target_dishes',
    'promotion_target_dishes_staging',
    'promotion_codes',
    'promotion_codes_staging',
    'audience_rules',
    'audience_rules_staging',
  ];

  for (const table of tables) {
    pgm.sql(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS change_in_progress boolean NOT NULL DEFAULT false`);
  }
};

exports.down = (pgm) => {
  const tables = [
    'promotion_eligibility',
    'promotion_eligibility_staging',
    'promotion_target_kitchens',
    'promotion_target_kitchens_staging',
    'promotion_target_dishes',
    'promotion_target_dishes_staging',
    'promotion_codes',
    'promotion_codes_staging',
    'audience_rules',
    'audience_rules_staging',
  ];

  for (const table of tables) {
    pgm.sql(`ALTER TABLE ${table} DROP COLUMN IF EXISTS change_in_progress`);
  }
};
