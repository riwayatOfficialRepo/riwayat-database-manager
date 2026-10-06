// For riwayat-database-manager — copy into its src/migrations/ and run there.
//
// Some wallet/loyalty timestamp columns are `timestamp without time zone`
// (e.g. loyalty_awards.expires_at / created_at / updated_at), others are
// already `timestamptz`. Without a zone, a value written from a server whose
// clock is not UTC is stored hours off. This converts every remaining plain
// `timestamp` column on these tables to `timestamptz`, reading existing values
// as UTC (what the database's now() default wrote). Columns that are already
// `timestamptz` are left untouched, so the migration is safe to re-run.

const TABLES = ['wallet_accounts', 'wallet_ledger', 'loyalty_awards', 'loyalty_rules', 'loyalty_exclusions', 'wallet_policy'];

exports.up = (pgm) => {
  pgm.sql(`
    DO $$
    DECLARE col RECORD;
    BEGIN
      FOR col IN
        SELECT table_name, column_name
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name IN (${TABLES.map((t) => `'${t}'`).join(', ')})
          AND data_type = 'timestamp without time zone'
      LOOP
        EXECUTE format(
          'ALTER TABLE public.%I ALTER COLUMN %I TYPE timestamptz USING %I AT TIME ZONE ''UTC''',
          col.table_name, col.column_name, col.column_name
        );
      END LOOP;
    END $$;
  `);
};

// Not reversed: which columns were converted depends on the database it ran on,
// and timestamptz is the type the module expects.
exports.down = () => {};
