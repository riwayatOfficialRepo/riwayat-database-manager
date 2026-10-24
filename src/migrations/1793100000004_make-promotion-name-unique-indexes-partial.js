/**
 * Promotion names: unique among non-deleted promotions only, so a soft-deleted DRAFT frees its names.
 *
 * On promotions and promotions_staging, the full-table uniqueness on name_internal (constraint <table>_name_internal_key)
 * and on lower(name_display) (index <table>_name_display_ci) is replaced by partial unique indexes WHERE deleted_at IS NULL:
 *   idx_<table>_name_internal_unique (name_internal), idx_<table>_name_display_lower_unique (lower(name_display)).
 *
 * down() drops the partial indexes and restores the original constraint and index. It fails if soft-deleted rows
 * share a name with another row by then.
 */

const TABLES = ['promotions', 'promotions_staging'];

exports.up = (pgm) => {
  for (const table of TABLES) {
    pgm.sql(`ALTER TABLE public.${table} DROP CONSTRAINT IF EXISTS ${table}_name_internal_key;`);
    pgm.sql(`DROP INDEX IF EXISTS public.${table}_name_display_ci;`);
    pgm.createIndex(table, ['name_internal'], {
      name: `idx_${table}_name_internal_unique`,
      unique: true,
      where: 'deleted_at IS NULL',
      ifNotExists: true,
    });
    pgm.sql(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_${table}_name_display_lower_unique ON public.${table} (lower(name_display))
      WHERE deleted_at IS NULL;`);
  }
};

exports.down = (pgm) => {
  for (const table of TABLES) {
    pgm.dropIndex(table, [], { name: `idx_${table}_name_internal_unique`, ifExists: true });
    pgm.sql(`DROP INDEX IF EXISTS public.idx_${table}_name_display_lower_unique;`);
    pgm.sql(String.raw`
DO $constraints$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '${table}'::regclass AND conname = '${table}_name_internal_key') THEN
    ALTER TABLE public.${table} ADD CONSTRAINT ${table}_name_internal_key UNIQUE (name_internal);
  END IF;
END
$constraints$;
`);
    pgm.sql(`CREATE UNIQUE INDEX IF NOT EXISTS ${table}_name_display_ci ON public.${table} (lower(name_display));`);
  }
};
