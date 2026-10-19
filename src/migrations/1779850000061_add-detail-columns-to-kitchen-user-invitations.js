exports.up = (pgm) => {
  pgm.sql(`
    ALTER TABLE kitchen_user_invitations
      ADD COLUMN IF NOT EXISTS kitchen_detail    JSONB,
      ADD COLUMN IF NOT EXISTS invited_by_detail JSONB
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    ALTER TABLE kitchen_user_invitations
      DROP COLUMN IF EXISTS kitchen_detail,
      DROP COLUMN IF EXISTS invited_by_detail
  `);
};
