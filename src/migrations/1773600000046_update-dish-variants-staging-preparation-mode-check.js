/**
 * Migration: Allow NULL in dish_variants_staging preparation_mode check constraint
 */

exports.up = (pgm) => {
  pgm.sql(`ALTER TABLE dish_variants_staging DROP CONSTRAINT IF EXISTS dish_variants_staging_preparation_mode_check`);
  pgm.sql(`
    ALTER TABLE dish_variants_staging
      ADD CONSTRAINT dish_variants_staging_preparation_mode_check
      CHECK (preparation_mode IS NULL OR preparation_mode IN ('ready', 'pre_order'));
  `);
};

exports.down = (pgm) => {
  pgm.sql(`ALTER TABLE dish_variants_staging DROP CONSTRAINT IF EXISTS dish_variants_staging_preparation_mode_check`);
  pgm.sql(`
    ALTER TABLE dish_variants_staging
      ADD CONSTRAINT dish_variants_staging_preparation_mode_check
      CHECK (preparation_mode IN ('ready', 'pre_order'));
  `);
};
