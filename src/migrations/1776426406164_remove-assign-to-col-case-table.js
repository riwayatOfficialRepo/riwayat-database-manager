exports.up =  (pgm) => {
  pgm.sql(`
    DO $$
    BEGIN
      ALTER TABLE cases 
      ADD COLUMN assigned_to TEXT;
    EXCEPTION
      WHEN duplicate_column THEN
        NULL;
    END
    $$;
  `);
};

exports.down =  (pgm) => {
  pgm.sql(`
    ALTER TABLE cases 
    DROP COLUMN IF EXISTS assigned_to;
  `);
};