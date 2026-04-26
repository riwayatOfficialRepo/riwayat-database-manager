exports.up = (pgm) => {
  pgm.sql(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM pg_type
        WHERE typname = 'rider_document_type_enum'
      ) THEN
        CREATE TYPE rider_document_type_enum AS ENUM (
          'NIC',
          'LICENCE',
          'VEHICLE_DOCUMENT'
        );
      END IF;
    END $$;
  `);

  pgm.sql(`
    UPDATE rider_documents
    SET document_type = CASE
      WHEN LOWER(TRIM(document_type)) IN ('nic') THEN 'NIC'
      WHEN LOWER(TRIM(document_type)) IN ('licence', 'license') THEN 'LICENCE'
      WHEN LOWER(TRIM(document_type)) IN (
        'vehicle_document',
        'vehicle document',
        'vehicledocument'
      ) THEN 'VEHICLE_DOCUMENT'
      ELSE document_type
    END
    WHERE document_type IS NOT NULL;
  `);

  pgm.sql(`
    ALTER TABLE rider_documents
    ALTER COLUMN document_type TYPE rider_document_type_enum
    USING document_type::rider_document_type_enum;
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    ALTER TABLE rider_documents
    ALTER COLUMN document_type TYPE text
    USING document_type::text;
  `);

  pgm.sql(`
    DROP TYPE IF EXISTS rider_document_type_enum;
  `);
};
