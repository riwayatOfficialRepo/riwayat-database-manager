/**
 * Legacy Neon/prod company_user rows may require company_id while seed uses
 * company_code + business_reference. Allow inserts without company_id.
 */
exports.up = (pgm) => {
  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE company_user ALTER COLUMN company_id DROP NOT NULL;
    EXCEPTION
      WHEN undefined_column THEN NULL;
      WHEN others THEN NULL;
    END $$;
  `);

  // company_id only exists on the legacy Neon table; a fresh database never has it.
  pgm.sql(`
    DO $$ BEGIN
      IF EXISTS (SELECT 1 FROM information_schema.columns
                  WHERE table_schema = 'public' AND table_name = 'company_user' AND column_name = 'company_id') THEN
        UPDATE company_user
        SET company_id = business_reference::uuid
        WHERE company_id IS NULL
          AND business_reference IS NOT NULL
          AND business_reference ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
      END IF;
    END $$;
  `);
};

exports.down = (pgm) => {
  // No-op: do not re-impose NOT NULL on legacy data.
};
