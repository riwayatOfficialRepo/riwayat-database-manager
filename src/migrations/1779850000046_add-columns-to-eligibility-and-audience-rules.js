exports.up = (pgm) => {
  const eligibilityTables = ['promotion_eligibility', 'promotion_eligibility_staging'];
  for (const table of eligibilityTables) {
    pgm.sql(`
      ALTER TABLE ${table}
        ADD COLUMN IF NOT EXISTS order_type      VARCHAR(50),
        ADD COLUMN IF NOT EXISTS payment_method  VARCHAR(50)
    `);
  }

  const audienceTables = ['promotion_audience_rules', 'promotion_audience_rules_staging'];
  for (const table of audienceTables) {
    pgm.sql(`
      ALTER TABLE ${table}
        ADD COLUMN IF NOT EXISTS audience_type  VARCHAR(50),
        ADD COLUMN IF NOT EXISTS loyalty_tier   VARCHAR(50),
        ADD COLUMN IF NOT EXISTS city_whitelist JSONB,
        ADD COLUMN IF NOT EXISTS customer_tag   JSONB
    `);
  }
};

exports.down = (pgm) => {
  const eligibilityTables = ['promotion_eligibility', 'promotion_eligibility_staging'];
  for (const table of eligibilityTables) {
    pgm.sql(`
      ALTER TABLE ${table}
        DROP COLUMN IF EXISTS order_type,
        DROP COLUMN IF EXISTS payment_method
    `);
  }

  const audienceTables = ['promotion_audience_rules', 'promotion_audience_rules_staging'];
  for (const table of audienceTables) {
    pgm.sql(`
      ALTER TABLE ${table}
        DROP COLUMN IF EXISTS audience_type,
        DROP COLUMN IF EXISTS loyalty_tier,
        DROP COLUMN IF EXISTS city_whitelist,
        DROP COLUMN IF EXISTS customer_tag
    `);
  }
};
