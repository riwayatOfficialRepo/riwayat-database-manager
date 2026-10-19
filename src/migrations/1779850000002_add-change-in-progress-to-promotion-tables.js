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

  // Skip tables that do not exist yet: on a fresh database promotion_target_kitchens/dishes are created
  // later (1779850000022), and 1779850000044 adds change_in_progress to them.
  for (const table of tables) {
    pgm.sql(`
      DO $$ BEGIN
        IF to_regclass('public.${table}') IS NOT NULL THEN
          ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS change_in_progress boolean NOT NULL DEFAULT false;
        END IF;
      END $$;
    `);
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
    pgm.sql(`ALTER TABLE IF EXISTS ${table} DROP COLUMN IF EXISTS change_in_progress`);
  }
};
