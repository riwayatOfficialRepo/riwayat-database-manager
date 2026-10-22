/**
 * Promotion domain: timestamps as timestamptz, as on the rest of the platform.
 *
 * created_at / updated_at / deleted_at of promotion_eligibility, promotion_audience_rules, promotion_codes (main and
 * staging) and deleted_at of promotions / promotions_staging were "timestamp without time zone". The stored values
 * are UTC, so they are converted with "AT TIME ZONE 'UTC'". Defaults (now()) and the updated_at triggers stay valid.
 * Each column is converted only while it still has the old type, so up() can run twice without shifting values.
 *
 * down() converts the same columns back to "timestamp without time zone" (UTC wall time).
 */

// [table, columns]
const COLUMNS = [
  ['promotion_eligibility', ['created_at', 'updated_at', 'deleted_at']],
  ['promotion_eligibility_staging', ['created_at', 'updated_at', 'deleted_at']],
  ['promotion_audience_rules', ['created_at', 'updated_at', 'deleted_at']],
  ['promotion_audience_rules_staging', ['created_at', 'updated_at', 'deleted_at']],
  ['promotion_codes', ['created_at', 'updated_at', 'deleted_at']],
  ['promotion_codes_staging', ['created_at', 'updated_at', 'deleted_at']],
  ['promotions', ['deleted_at']],
  ['promotions_staging', ['deleted_at']],
];

// Converts the column only if the table exists and the column still has the source type.
const convert = (table, column, fromType, toType) => `
  DO $$ BEGIN
    IF to_regclass('public.${table}') IS NOT NULL AND EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = '${table}' AND column_name = '${column}' AND data_type = '${fromType}'
    ) THEN
      ALTER TABLE public.${table} ALTER COLUMN ${column} TYPE ${toType} USING ${column} AT TIME ZONE 'UTC';
    END IF;
  END $$;`;

exports.up = (pgm) => {
  for (const [table, columns] of COLUMNS) {
    for (const column of columns) {
      pgm.sql(convert(table, column, 'timestamp without time zone', 'timestamptz'));
    }
  }
};

exports.down = (pgm) => {
  for (const [table, columns] of COLUMNS) {
    for (const column of columns) {
      pgm.sql(convert(table, column, 'timestamp with time zone', 'timestamp'));
    }
  }
};
