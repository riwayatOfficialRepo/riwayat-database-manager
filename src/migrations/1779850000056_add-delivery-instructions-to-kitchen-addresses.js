exports.up = (pgm) => {
  pgm.sql(`ALTER TABLE kitchen_addresses         ADD COLUMN IF NOT EXISTS delivery_instructions TEXT`);
  pgm.sql(`ALTER TABLE kitchen_addresses_staging ADD COLUMN IF NOT EXISTS delivery_instructions TEXT`);
};

exports.down = (pgm) => {
  pgm.sql(`ALTER TABLE kitchen_addresses         DROP COLUMN IF EXISTS delivery_instructions`);
  pgm.sql(`ALTER TABLE kitchen_addresses_staging DROP COLUMN IF EXISTS delivery_instructions`);
};
