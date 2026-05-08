/**
 * Migration: Update preparation_mode and preparation_time_unit check constraints
 * to use uppercase values (READY, PRE_ORDER, MINUTES, HOURS) on dishes and dishes_staging.
 */

exports.up = (pgm) => {
  // Migrate existing data to uppercase before tightening constraints
  pgm.sql(`UPDATE dishes SET preparation_mode = UPPER(preparation_mode) WHERE preparation_mode IS NOT NULL`);
  pgm.sql(`UPDATE dishes SET preparation_time_unit = UPPER(preparation_time_unit) WHERE preparation_time_unit IS NOT NULL`);
  pgm.sql(`UPDATE dishes_staging SET preparation_mode = UPPER(preparation_mode) WHERE preparation_mode IS NOT NULL`);
  pgm.sql(`UPDATE dishes_staging SET preparation_time_unit = UPPER(preparation_time_unit) WHERE preparation_time_unit IS NOT NULL`);

  // dishes table
  pgm.sql(`ALTER TABLE dishes DROP CONSTRAINT IF EXISTS dishes_preparation_mode_check`);
  pgm.sql(`ALTER TABLE dishes ADD CONSTRAINT dishes_preparation_mode_check CHECK (preparation_mode IN ('READY', 'PRE_ORDER'))`);

  pgm.sql(`ALTER TABLE dishes DROP CONSTRAINT IF EXISTS dishes_preparation_time_unit_check`);
  pgm.sql(`ALTER TABLE dishes ADD CONSTRAINT dishes_preparation_time_unit_check CHECK (preparation_time_unit IN ('MINUTES', 'HOURS'))`);

  // dishes_staging table
  pgm.sql(`ALTER TABLE dishes_staging DROP CONSTRAINT IF EXISTS dishes_staging_preparation_mode_check`);
  pgm.sql(`ALTER TABLE dishes_staging ADD CONSTRAINT dishes_staging_preparation_mode_check CHECK (preparation_mode IN ('READY', 'PRE_ORDER'))`);

  pgm.sql(`ALTER TABLE dishes_staging DROP CONSTRAINT IF EXISTS dishes_staging_preparation_time_unit_check`);
  pgm.sql(`ALTER TABLE dishes_staging ADD CONSTRAINT dishes_staging_preparation_time_unit_check CHECK (preparation_time_unit IN ('MINUTES', 'HOURS'))`);
};

exports.down = (pgm) => {
  // Revert constraints to lowercase
  pgm.sql(`ALTER TABLE dishes DROP CONSTRAINT IF EXISTS dishes_preparation_mode_check`);
  pgm.sql(`ALTER TABLE dishes ADD CONSTRAINT dishes_preparation_mode_check CHECK (preparation_mode IN ('ready', 'pre_order'))`);

  pgm.sql(`ALTER TABLE dishes DROP CONSTRAINT IF EXISTS dishes_preparation_time_unit_check`);
  pgm.sql(`ALTER TABLE dishes ADD CONSTRAINT dishes_preparation_time_unit_check CHECK (preparation_time_unit IN ('minutes', 'hours'))`);

  pgm.sql(`ALTER TABLE dishes_staging DROP CONSTRAINT IF EXISTS dishes_staging_preparation_mode_check`);
  pgm.sql(`ALTER TABLE dishes_staging ADD CONSTRAINT dishes_staging_preparation_mode_check CHECK (preparation_mode IN ('ready', 'pre_order'))`);

  pgm.sql(`ALTER TABLE dishes_staging DROP CONSTRAINT IF EXISTS dishes_staging_preparation_time_unit_check`);
  pgm.sql(`ALTER TABLE dishes_staging ADD CONSTRAINT dishes_staging_preparation_time_unit_check CHECK (preparation_time_unit IN ('minutes', 'hours'))`);

  // Revert data back to lowercase
  pgm.sql(`UPDATE dishes SET preparation_mode = LOWER(preparation_mode) WHERE preparation_mode IS NOT NULL`);
  pgm.sql(`UPDATE dishes SET preparation_time_unit = LOWER(preparation_time_unit) WHERE preparation_time_unit IS NOT NULL`);
  pgm.sql(`UPDATE dishes_staging SET preparation_mode = LOWER(preparation_mode) WHERE preparation_mode IS NOT NULL`);
  pgm.sql(`UPDATE dishes_staging SET preparation_time_unit = LOWER(preparation_time_unit) WHERE preparation_time_unit IS NOT NULL`);
};
