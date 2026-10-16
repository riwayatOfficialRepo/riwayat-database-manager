/**
 * Backfill companion to 1779850000002.
 *
 * promotion_target_kitchens / promotion_target_dishes (+ staging) are created by
 * 1779850000022, AFTER 1779850000002 runs — so 1779850000002 skips them. This
 * migration (numbered after 022/026/032) adds change_in_progress to those
 * late-created tables. Guarded + IF NOT EXISTS, so it's a no-op where the column
 * already exists or the table doesn't.
 */

const TABLES = [
  'promotion_target_kitchens',
  'promotion_target_kitchens_staging',
  'promotion_target_dishes',
  'promotion_target_dishes_staging',
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
