exports.up = (pgm) => {
  const tables = [
    'promotion_eligibility',
    'promotion_eligibility_staging',
    'promotion_audience_rules',
    'promotion_audience_rules_staging',
    'promotion_codes',
    'promotion_codes_staging',
    'promotion_target_kitchens',
    'promotion_target_dishes',
    'promotion_target_variants',
  ];

  for (const table of tables) {
    pgm.sql(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS change_in_progress BOOLEAN NOT NULL DEFAULT false`);
  }
};

exports.down = (pgm) => {
  const tables = [
    'promotion_eligibility',
    'promotion_eligibility_staging',
    'promotion_audience_rules',
    'promotion_audience_rules_staging',
    'promotion_codes',
    'promotion_codes_staging',
    'promotion_target_kitchens',
    'promotion_target_dishes',
    'promotion_target_variants',
  ];

  for (const table of tables) {
    pgm.sql(`ALTER TABLE ${table} DROP COLUMN IF EXISTS change_in_progress`);
  }
};
