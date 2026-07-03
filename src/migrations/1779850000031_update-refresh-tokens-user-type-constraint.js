exports.up = (pgm) => {
  pgm.sql(`ALTER TABLE refresh_tokens DROP CONSTRAINT IF EXISTS chk_refresh_tokens_user_type`);
  pgm.sql(`
    ALTER TABLE refresh_tokens
      ADD CONSTRAINT chk_refresh_tokens_user_type
      CHECK (user_type IN ('PARTNER', 'ADMIN', 'TEAM', 'CUSTOMER', 'DELIVERY_DRIVER', 'RIDER'))
  `);
};

exports.down = (pgm) => {
  pgm.sql(`ALTER TABLE refresh_tokens DROP CONSTRAINT IF EXISTS chk_refresh_tokens_user_type`);
  pgm.sql(`
    ALTER TABLE refresh_tokens
      ADD CONSTRAINT chk_refresh_tokens_user_type
      CHECK (user_type IN ('PARTNER', 'TEAM', 'CUSTOMER'))
  `);
};
