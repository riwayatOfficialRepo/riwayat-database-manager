exports.up = (pgm) => {
  pgm.sql(`
    ALTER TABLE change_requests
      ADD COLUMN IF NOT EXISTS rejected_by        UUID,
      ADD COLUMN IF NOT EXISTS entity_detail      JSONB,
      ADD COLUMN IF NOT EXISTS sub_entity_detail  JSONB
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    ALTER TABLE change_requests
      DROP COLUMN IF EXISTS sub_entity_detail,
      DROP COLUMN IF EXISTS entity_detail,
      DROP COLUMN IF EXISTS rejected_by
  `);
};
