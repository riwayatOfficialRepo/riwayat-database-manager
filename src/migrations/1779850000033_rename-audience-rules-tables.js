exports.up = (pgm) => {
  pgm.sql(`ALTER TABLE IF EXISTS audience_rules_staging RENAME TO promotion_audience_rules_staging`);
  pgm.sql(`ALTER TABLE IF EXISTS audience_rules RENAME TO promotion_audience_rules`);
};

exports.down = (pgm) => {
  pgm.sql(`ALTER TABLE IF EXISTS promotion_audience_rules RENAME TO audience_rules`);
  pgm.sql(`ALTER TABLE IF EXISTS promotion_audience_rules_staging RENAME TO audience_rules_staging`);
};
