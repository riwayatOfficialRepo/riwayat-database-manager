exports.up = (pgm) => {
  pgm.sql(`ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS business_reference VARCHAR(100)`);
};

exports.down = (pgm) => {
  pgm.sql(`ALTER TABLE admin_users DROP COLUMN IF EXISTS business_reference`);
};
