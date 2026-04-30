/**
 * Migration: Rename standalone_min_order_limit to min_order_limit_standalone
 * in dish_variants and dish_variants_staging for naming consistency
 */

exports.up = (pgm) => {
  pgm.sql(`ALTER TABLE dish_variants RENAME COLUMN standalone_min_order_limit TO min_order_limit_standalone`);
  pgm.sql(`ALTER TABLE dish_variants_staging RENAME COLUMN standalone_min_order_limit TO min_order_limit_standalone`);
};

exports.down = (pgm) => {
  pgm.sql(`ALTER TABLE dish_variants RENAME COLUMN min_order_limit_standalone TO standalone_min_order_limit`);
  pgm.sql(`ALTER TABLE dish_variants_staging RENAME COLUMN min_order_limit_standalone TO standalone_min_order_limit`);
};
