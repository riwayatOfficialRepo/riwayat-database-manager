exports.up = (pgm) => {
  pgm.sql(`ALTER TABLE kitchens_staging ADD COLUMN IF NOT EXISTS operational_status varchar(30)`);
  pgm.sql(`ALTER TABLE dishes_staging ADD COLUMN IF NOT EXISTS operational_status varchar(30)`);
};

exports.down = (pgm) => {
  pgm.sql(`ALTER TABLE kitchens_staging DROP COLUMN IF EXISTS operational_status`);
  pgm.sql(`ALTER TABLE dishes_staging DROP COLUMN IF EXISTS operational_status`);
};
