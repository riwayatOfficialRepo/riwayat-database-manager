exports.up = (pgm) => {
  pgm.sql(`
    ALTER TABLE feedbacks
      ADD COLUMN IF NOT EXISTS customer_detail JSONB,
      ADD COLUMN IF NOT EXISTS kitchen_detail  JSONB,
      ADD COLUMN IF NOT EXISTS order_detail    JSONB,
      DROP COLUMN IF EXISTS feedback_business_reference,
      DROP COLUMN IF EXISTS customer_business_reference,
      DROP COLUMN IF EXISTS kitchen_business_reference,
      DROP COLUMN IF EXISTS order_business_reference,
      DROP COLUMN IF EXISTS customer_name,
      DROP COLUMN IF EXISTS kitchen_name,
      DROP COLUMN IF EXISTS order_name
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    ALTER TABLE feedbacks
      DROP COLUMN IF EXISTS customer_detail,
      DROP COLUMN IF EXISTS kitchen_detail,
      DROP COLUMN IF EXISTS order_detail,
      ADD COLUMN IF NOT EXISTS feedback_business_reference VARCHAR(50),
      ADD COLUMN IF NOT EXISTS customer_business_reference VARCHAR(255),
      ADD COLUMN IF NOT EXISTS kitchen_business_reference  VARCHAR(255),
      ADD COLUMN IF NOT EXISTS order_business_reference    VARCHAR(255),
      ADD COLUMN IF NOT EXISTS customer_name               VARCHAR(255),
      ADD COLUMN IF NOT EXISTS kitchen_name                VARCHAR(255),
      ADD COLUMN IF NOT EXISTS order_name                  VARCHAR(255)
  `);
};
