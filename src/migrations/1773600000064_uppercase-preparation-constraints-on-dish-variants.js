exports.up = (pgm) => {
  // Migrate existing data to uppercase
  pgm.sql(`UPDATE dish_variants SET preparation_mode = UPPER(preparation_mode) WHERE preparation_mode IS NOT NULL`);
  pgm.sql(`UPDATE dish_variants SET preparation_unit = UPPER(preparation_unit) WHERE preparation_unit IS NOT NULL`);
  pgm.sql(`UPDATE dish_variants_staging SET preparation_mode = UPPER(preparation_mode) WHERE preparation_mode IS NOT NULL`);
  pgm.sql(`UPDATE dish_variants_staging SET preparation_unit = UPPER(preparation_unit) WHERE preparation_unit IS NOT NULL`);

  // dish_variants
  pgm.sql(`ALTER TABLE dish_variants DROP CONSTRAINT IF EXISTS dish_variants_preparation_mode_check`);
  pgm.sql(`ALTER TABLE dish_variants ADD CONSTRAINT dish_variants_preparation_mode_check CHECK (preparation_mode IN ('READY', 'PRE_ORDER'))`);

  pgm.sql(`ALTER TABLE dish_variants DROP CONSTRAINT IF EXISTS dish_variants_preparation_unit_check`);
  pgm.sql(`ALTER TABLE dish_variants ADD CONSTRAINT dish_variants_preparation_unit_check CHECK (preparation_unit IN ('MINUTES', 'HOURS', 'DAYS'))`);

  // dish_variants_staging
  pgm.sql(`ALTER TABLE dish_variants_staging DROP CONSTRAINT IF EXISTS dish_variants_staging_preparation_mode_check`);
  pgm.sql(`ALTER TABLE dish_variants_staging ADD CONSTRAINT dish_variants_staging_preparation_mode_check CHECK (preparation_mode IS NULL OR preparation_mode IN ('READY', 'PRE_ORDER'))`);

  pgm.sql(`ALTER TABLE dish_variants_staging DROP CONSTRAINT IF EXISTS dish_variants_staging_preparation_unit_check`);
  pgm.sql(`ALTER TABLE dish_variants_staging ADD CONSTRAINT dish_variants_staging_preparation_unit_check CHECK (preparation_unit IS NULL OR preparation_unit IN ('MINUTES', 'HOURS', 'DAYS'))`);
};

exports.down = (pgm) => {
  pgm.sql(`UPDATE dish_variants SET preparation_mode = LOWER(preparation_mode) WHERE preparation_mode IS NOT NULL`);
  pgm.sql(`UPDATE dish_variants SET preparation_unit = LOWER(preparation_unit) WHERE preparation_unit IS NOT NULL`);
  pgm.sql(`UPDATE dish_variants_staging SET preparation_mode = LOWER(preparation_mode) WHERE preparation_mode IS NOT NULL`);
  pgm.sql(`UPDATE dish_variants_staging SET preparation_unit = LOWER(preparation_unit) WHERE preparation_unit IS NOT NULL`);

  pgm.sql(`ALTER TABLE dish_variants DROP CONSTRAINT IF EXISTS dish_variants_preparation_mode_check`);
  pgm.sql(`ALTER TABLE dish_variants ADD CONSTRAINT dish_variants_preparation_mode_check CHECK (preparation_mode IN ('ready', 'pre_order'))`);

  pgm.sql(`ALTER TABLE dish_variants DROP CONSTRAINT IF EXISTS dish_variants_preparation_unit_check`);
  pgm.sql(`ALTER TABLE dish_variants ADD CONSTRAINT dish_variants_preparation_unit_check CHECK (preparation_unit IN ('minutes', 'hours'))`);

  pgm.sql(`ALTER TABLE dish_variants_staging DROP CONSTRAINT IF EXISTS dish_variants_staging_preparation_mode_check`);
  pgm.sql(`ALTER TABLE dish_variants_staging ADD CONSTRAINT dish_variants_staging_preparation_mode_check CHECK (preparation_mode IS NULL OR preparation_mode IN ('ready', 'pre_order'))`);

  pgm.sql(`ALTER TABLE dish_variants_staging DROP CONSTRAINT IF EXISTS dish_variants_staging_preparation_unit_check`);
  pgm.sql(`ALTER TABLE dish_variants_staging ADD CONSTRAINT dish_variants_staging_preparation_unit_check CHECK (preparation_unit IS NULL OR preparation_unit IN ('minutes', 'hours', 'days'))`);
};
