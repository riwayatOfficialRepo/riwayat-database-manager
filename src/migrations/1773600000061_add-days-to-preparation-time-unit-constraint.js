exports.up = (pgm) => {
  pgm.sql(`ALTER TABLE dishes DROP CONSTRAINT IF EXISTS dishes_preparation_time_unit_check`);
  pgm.sql(`ALTER TABLE dishes ADD CONSTRAINT dishes_preparation_time_unit_check CHECK (preparation_time_unit IN ('MINUTES', 'HOURS', 'DAYS'))`);

  pgm.sql(`ALTER TABLE dishes_staging DROP CONSTRAINT IF EXISTS dishes_staging_preparation_time_unit_check`);
  pgm.sql(`ALTER TABLE dishes_staging ADD CONSTRAINT dishes_staging_preparation_time_unit_check CHECK (preparation_time_unit IN ('MINUTES', 'HOURS', 'DAYS'))`);
};

exports.down = (pgm) => {
  pgm.sql(`ALTER TABLE dishes DROP CONSTRAINT IF EXISTS dishes_preparation_time_unit_check`);
  pgm.sql(`ALTER TABLE dishes ADD CONSTRAINT dishes_preparation_time_unit_check CHECK (preparation_time_unit IN ('MINUTES', 'HOURS'))`);

  pgm.sql(`ALTER TABLE dishes_staging DROP CONSTRAINT IF EXISTS dishes_staging_preparation_time_unit_check`);
  pgm.sql(`ALTER TABLE dishes_staging ADD CONSTRAINT dishes_staging_preparation_time_unit_check CHECK (preparation_time_unit IN ('MINUTES', 'HOURS'))`);
};
