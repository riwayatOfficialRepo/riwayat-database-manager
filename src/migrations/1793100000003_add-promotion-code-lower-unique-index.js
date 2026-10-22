/**
 * Promotion codes: unique case-insensitively among non-deleted codes, across promotions.
 *
 * Partial unique expression indexes on lower(code) WHERE deleted_at IS NULL AND code IS NOT NULL, on promotion_codes
 * and promotion_codes_staging. The existing promotion_codes_promotion_id_code_key constraint is kept.
 *
 * down() drops both indexes.
 */

const TABLES = ['promotion_codes', 'promotion_codes_staging'];

exports.up = (pgm) => {
  for (const table of TABLES) {
    pgm.sql(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_${table}_code_lower_unique ON public.${table} (lower(code))
      WHERE deleted_at IS NULL AND code IS NOT NULL;`);
  }
};

exports.down = (pgm) => {
  for (const table of TABLES) {
    pgm.sql(`DROP INDEX IF EXISTS public.idx_${table}_code_lower_unique;`);
  }
};
