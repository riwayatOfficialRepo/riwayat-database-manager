exports.up = (pgm) => {
  pgm.sql(`ALTER TABLE promotions ADD COLUMN IF NOT EXISTS operational_status varchar(30)`);
  pgm.sql(`ALTER TABLE promotions_staging ADD COLUMN IF NOT EXISTS operational_status varchar(30)`);
};

exports.down = (pgm) => {
  pgm.sql(`ALTER TABLE promotions DROP COLUMN IF EXISTS operational_status`);
  pgm.sql(`ALTER TABLE promotions_staging DROP COLUMN IF EXISTS operational_status`);
};
