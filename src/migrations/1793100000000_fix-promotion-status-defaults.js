/**
 * Promotion domain: plain capital status defaults.
 *
 * Several promotion tables were created with a quoted default ('''DRAFT''' stores the value 'DRAFT' including the
 * quotes) or a lowercase one. up() sets the defaults below and strips the quotes / uppercases existing rows:
 *   promotion_eligibility, promotion_eligibility_staging, promotion_codes, promotion_codes_staging,
 *   promotion_audience_rules_staging -> 'DRAFT'; promotion_audience_rules -> 'ACTIVE';
 *   promotion_targets -> 'PROCESSING'; promotion_target_kitchens / _dishes / _variants -> 'DRAFT'.
 *
 * down() restores the previous defaults (quoted / lowercase); the row clean-up is not undone.
 */

// [table, default (capitals), previous default]
const COLUMNS = [
  ['promotion_eligibility', 'DRAFT', `'''DRAFT'''`],
  ['promotion_eligibility_staging', 'DRAFT', `'''DRAFT'''`],
  ['promotion_codes', 'DRAFT', `'''DRAFT'''`],
  ['promotion_codes_staging', 'DRAFT', `'''DRAFT'''`],
  ['promotion_audience_rules', 'ACTIVE', `'''ACTIVE'''`],
  ['promotion_audience_rules_staging', 'DRAFT', `'''DRAFT'''`],
  ['promotion_targets', 'PROCESSING', `'''processing'''`],
  ['promotion_target_kitchens', 'DRAFT', `'''draft'''`],
  ['promotion_target_dishes', 'DRAFT', `'''active'''`],
  ['promotion_target_variants', 'DRAFT', `'''active'''`],
];

// A table may be missing on a database built before the production schema sync: skip it there.
const guarded = (table, sql) => `
  DO $$ BEGIN
    IF to_regclass('public.${table}') IS NOT NULL THEN
      ${sql}
    END IF;
  END $$;`;

exports.up = (pgm) => {
  for (const [table, def] of COLUMNS) {
    pgm.sql(guarded(table, `
      UPDATE public.${table} SET status = upper(btrim(status, '''')) WHERE status <> upper(btrim(status, ''''));
      ALTER TABLE public.${table} ALTER COLUMN status SET DEFAULT '${def}';`));
  }
};

exports.down = (pgm) => {
  for (const [table, , previous] of COLUMNS) {
    pgm.sql(guarded(table, `ALTER TABLE public.${table} ALTER COLUMN status SET DEFAULT ${previous};`));
  }
};
