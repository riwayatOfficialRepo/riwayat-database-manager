exports.up = (pgm) => {
  pgm.sql(`ALTER TABLE kitchen_users ADD COLUMN IF NOT EXISTS is_onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE`);
};

exports.down = (pgm) => {
  pgm.sql(`ALTER TABLE kitchen_users DROP COLUMN IF EXISTS is_onboarding_completed`);
};
