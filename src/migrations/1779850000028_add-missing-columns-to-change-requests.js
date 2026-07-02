exports.up = (pgm) => {
  pgm.sql(`
    ALTER TABLE change_requests
      ADD COLUMN IF NOT EXISTS business_reference       VARCHAR(100),
      ADD COLUMN IF NOT EXISTS workflow_type            VARCHAR(100),
      ADD COLUMN IF NOT EXISTS requested_at             TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS requested_by_details     JSONB,
      ADD COLUMN IF NOT EXISTS reviewed_by_details      JSONB,
      ADD COLUMN IF NOT EXISTS rejected_at              TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS rejected_by_details      JSONB,
      ADD COLUMN IF NOT EXISTS cancelled_by             UUID,
      ADD COLUMN IF NOT EXISTS cancelled_at             TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS cancelled_by_details     JSONB,
      ADD COLUMN IF NOT EXISTS execution_attempts       INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS last_executed_at         TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS last_executed_by         UUID,
      ADD COLUMN IF NOT EXISTS last_executed_by_details JSONB,
      ADD COLUMN IF NOT EXISTS is_deleted               BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS deleted_by               UUID,
      ADD COLUMN IF NOT EXISTS deleted_by_details       JSONB
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    ALTER TABLE change_requests
      DROP COLUMN IF EXISTS deleted_by_details,
      DROP COLUMN IF EXISTS deleted_by,
      DROP COLUMN IF EXISTS is_deleted,
      DROP COLUMN IF EXISTS last_executed_by_details,
      DROP COLUMN IF EXISTS last_executed_by,
      DROP COLUMN IF EXISTS last_executed_at,
      DROP COLUMN IF EXISTS execution_attempts,
      DROP COLUMN IF EXISTS cancelled_by_details,
      DROP COLUMN IF EXISTS cancelled_at,
      DROP COLUMN IF EXISTS cancelled_by,
      DROP COLUMN IF EXISTS rejected_by_details,
      DROP COLUMN IF EXISTS rejected_at,
      DROP COLUMN IF EXISTS reviewed_by_details,
      DROP COLUMN IF EXISTS requested_by_details,
      DROP COLUMN IF EXISTS requested_at,
      DROP COLUMN IF EXISTS workflow_type,
      DROP COLUMN IF EXISTS business_reference
  `);
};
