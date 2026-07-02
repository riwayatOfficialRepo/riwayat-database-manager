exports.up = (pgm) => {
  pgm.sql(`
    ALTER TABLE promotions
      DROP COLUMN IF EXISTS percent_value,
      DROP COLUMN IF EXISTS amount_minor,
      DROP COLUMN IF EXISTS currency_code,
      DROP COLUMN IF EXISTS max_discount_minor,
      DROP COLUMN IF EXISTS buy_qty,
      DROP COLUMN IF EXISTS get_qty,
      DROP COLUMN IF EXISTS free_lowest_item,
      DROP COLUMN IF EXISTS usage_limit_per_user,
      DROP COLUMN IF EXISTS usage_limit_total,
      DROP COLUMN IF EXISTS daily_usage_limit,
      DROP COLUMN IF EXISTS max_orders_flashsale,
      DROP COLUMN IF EXISTS customer_message
  `);

  pgm.sql(`
    ALTER TABLE promotions_staging
      DROP COLUMN IF EXISTS percent_value,
      DROP COLUMN IF EXISTS amount_minor,
      DROP COLUMN IF EXISTS currency_code,
      DROP COLUMN IF EXISTS max_discount_minor,
      DROP COLUMN IF EXISTS buy_qty,
      DROP COLUMN IF EXISTS get_qty,
      DROP COLUMN IF EXISTS free_lowest_item,
      DROP COLUMN IF EXISTS usage_limit_per_user,
      DROP COLUMN IF EXISTS usage_limit_total,
      DROP COLUMN IF EXISTS daily_usage_limit,
      DROP COLUMN IF EXISTS max_orders_flashsale,
      DROP COLUMN IF EXISTS customer_message
  `);

  pgm.sql(`
    ALTER TABLE promotion_eligibility
      DROP COLUMN IF EXISTS preorder_lead_hours,
      DROP COLUMN IF EXISTS delivery_zone_ids,
      DROP COLUMN IF EXISTS max_discount_percent,
      DROP COLUMN IF EXISTS extra_json
  `);

  pgm.sql(`
    ALTER TABLE promotion_eligibility_staging
      DROP COLUMN IF EXISTS preorder_lead_hours,
      DROP COLUMN IF EXISTS delivery_zone_ids,
      DROP COLUMN IF EXISTS max_discount_percent,
      DROP COLUMN IF EXISTS extra_json
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    ALTER TABLE promotion_eligibility_staging
      ADD COLUMN IF NOT EXISTS preorder_lead_hours  INTEGER,
      ADD COLUMN IF NOT EXISTS delivery_zone_ids    UUID[],
      ADD COLUMN IF NOT EXISTS max_discount_percent NUMERIC(5,2),
      ADD COLUMN IF NOT EXISTS extra_json           JSONB
  `);

  pgm.sql(`
    ALTER TABLE promotion_eligibility
      ADD COLUMN IF NOT EXISTS preorder_lead_hours  INTEGER,
      ADD COLUMN IF NOT EXISTS delivery_zone_ids    UUID[],
      ADD COLUMN IF NOT EXISTS max_discount_percent NUMERIC(5,2),
      ADD COLUMN IF NOT EXISTS extra_json           JSONB
  `);

  pgm.sql(`
    ALTER TABLE promotions_staging
      ADD COLUMN IF NOT EXISTS percent_value        NUMERIC(5,2),
      ADD COLUMN IF NOT EXISTS amount_minor         BIGINT,
      ADD COLUMN IF NOT EXISTS currency_code        CHAR(3) DEFAULT 'PKR',
      ADD COLUMN IF NOT EXISTS max_discount_minor   BIGINT,
      ADD COLUMN IF NOT EXISTS buy_qty              INTEGER,
      ADD COLUMN IF NOT EXISTS get_qty              INTEGER,
      ADD COLUMN IF NOT EXISTS free_lowest_item     BOOLEAN,
      ADD COLUMN IF NOT EXISTS usage_limit_per_user INTEGER,
      ADD COLUMN IF NOT EXISTS usage_limit_total    INTEGER,
      ADD COLUMN IF NOT EXISTS daily_usage_limit    INTEGER,
      ADD COLUMN IF NOT EXISTS max_orders_flashsale INTEGER,
      ADD COLUMN IF NOT EXISTS customer_message     VARCHAR(200)
  `);

  pgm.sql(`
    ALTER TABLE promotions
      ADD COLUMN IF NOT EXISTS percent_value        NUMERIC(5,2),
      ADD COLUMN IF NOT EXISTS amount_minor         BIGINT,
      ADD COLUMN IF NOT EXISTS currency_code        CHAR(3) DEFAULT 'PKR',
      ADD COLUMN IF NOT EXISTS max_discount_minor   BIGINT,
      ADD COLUMN IF NOT EXISTS buy_qty              INTEGER,
      ADD COLUMN IF NOT EXISTS get_qty              INTEGER,
      ADD COLUMN IF NOT EXISTS free_lowest_item     BOOLEAN,
      ADD COLUMN IF NOT EXISTS usage_limit_per_user INTEGER,
      ADD COLUMN IF NOT EXISTS usage_limit_total    INTEGER,
      ADD COLUMN IF NOT EXISTS daily_usage_limit    INTEGER,
      ADD COLUMN IF NOT EXISTS max_orders_flashsale INTEGER,
      ADD COLUMN IF NOT EXISTS customer_message     VARCHAR(200)
  `);
};
