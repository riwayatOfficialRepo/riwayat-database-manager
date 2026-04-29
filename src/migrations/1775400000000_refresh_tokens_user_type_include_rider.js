/**
 * Allow refresh_tokens.user_type = 'RIDER' (rider app JWT flow).
 * Replaces legacy chk_refresh_tokens_user_type when present.
 */

exports.up = (pgm) => {
  pgm.sql(`
    ALTER TABLE refresh_tokens DROP CONSTRAINT IF EXISTS chk_refresh_tokens_user_type;
  `);
  pgm.sql(`
    ALTER TABLE refresh_tokens ADD CONSTRAINT chk_refresh_tokens_user_type
    CHECK (user_type IN ('PARTNER', 'ADMIN', 'CUSTOMER', 'DELIVERY_DRIVER', 'RIDER'));
  `);
  pgm.sql(`
    COMMENT ON COLUMN refresh_tokens.user_type IS
      'JWT auth user type: PARTNER, ADMIN, CUSTOMER, DELIVERY_DRIVER, RIDER';
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    ALTER TABLE refresh_tokens DROP CONSTRAINT IF EXISTS chk_refresh_tokens_user_type;
  `);
  pgm.sql(`
    ALTER TABLE refresh_tokens ADD CONSTRAINT chk_refresh_tokens_user_type
    CHECK (user_type IN ('PARTNER', 'ADMIN', 'CUSTOMER', 'DELIVERY_DRIVER'));
  `);
  pgm.sql(`
    COMMENT ON COLUMN refresh_tokens.user_type IS
      'Type of user: PARTNER, ADMIN, CUSTOMER, or DELIVERY_DRIVER';
  `);
};
