/**
 * Adds change_in_progress to the promotion tables.
 *
 * NOTE (ordering): some of these tables (promotion_target_kitchens/_dishes and
 * their staging variants) are created by a LATER migration (1779850000022). With
 * --no-check-order this migration runs first, so it must NOT hard-fail on tables
 * that don't exist yet. Each ALTER is guarded by a to_regclass() existence check;
 * the companion backfill migration (1779850000034) adds the column to the
 * late-created tables. Combined, the column ends up on every promotion table that
 * actually exists, regardless of migration order. Idempotent (ADD COLUMN IF NOT EXISTS).
 */

const TABLES = [
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

exports.up = (pgm) => {
  for (const table of TABLES) {
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
  for (const table of TABLES) {
    pgm.sql(`
      DO $$ BEGIN
        IF to_regclass('public.${table}') IS NOT NULL THEN
          ALTER TABLE ${table} DROP COLUMN IF EXISTS change_in_progress;
        END IF;
      END $$;
    `);
  }
};
