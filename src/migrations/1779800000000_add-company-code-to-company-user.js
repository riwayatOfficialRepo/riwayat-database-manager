exports.up = (pgm) => {
  pgm.sql(`
    ALTER TABLE company_user
      ADD COLUMN IF NOT EXISTS company_code varchar(50);
  `);

  pgm.sql(`
    UPDATE company_user cu
    SET company_code = c.company_code
    FROM companies c
    WHERE cu.company_code IS NULL
      AND (
        cu.business_reference = c.id::text
        OR UPPER(cu.business_reference) = UPPER(c.company_code)
      );
  `);

  pgm.sql(`
    ALTER TABLE company_user
      ALTER COLUMN company_code SET NOT NULL;
  `);

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE company_user
        ADD CONSTRAINT company_user_company_code_fkey
        FOREIGN KEY (company_code) REFERENCES companies(company_code)
        ON UPDATE CASCADE ON DELETE RESTRICT;
    EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL;
    END $$;
  `);

  pgm.createIndex('company_user', 'company_code', {
    name: 'idx_company_user_company_code',
    ifNotExists: true,
  });
};

exports.down = (pgm) => {
  pgm.sql('DROP INDEX IF EXISTS idx_company_user_company_code');
  pgm.sql('ALTER TABLE company_user DROP CONSTRAINT IF EXISTS company_user_company_code_fkey');
  pgm.sql('ALTER TABLE company_user DROP COLUMN IF EXISTS company_code');
};
