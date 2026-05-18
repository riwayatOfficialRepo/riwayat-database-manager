

/**
 * Migration: Create promotion_eligibility and promotion_eligibility_staging tables
 */

exports.up = (pgm) => {
  // ── trigger functions ────────────────────────────────────────
  pgm.sql(`
    CREATE OR REPLACE FUNCTION update_promotion_eligibility_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  pgm.sql(`
    CREATE OR REPLACE FUNCTION update_promotion_eligibility_staging_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  // ── promotion_eligibility ────────────────────────────────────
  pgm.createTable(
    'promotion_eligibility',
    {
      id: {
        type: 'uuid',
        primaryKey: true,
        default: pgm.func('gen_random_uuid()'),
        notNull: true,
      },
      promotion_id: { type: 'uuid', notNull: true },

      // Minimum order value
      is_minimum_order_value: { type: 'boolean', default: false },
      min_order_minor: { type: 'bigint' },

      // Minimum items
      is_minimum_items: { type: 'boolean', default: false },
      min_items: { type: 'integer' },

      // Minimum previous orders
      is_minimum_previous_order: { type: 'boolean', default: false },
      min_previous_orders: { type: 'integer' },

      // Inactive days
      is_inactive_days: { type: 'boolean', default: false },
      inactive_days: { type: 'integer' },

      // Time window
      days_of_week: { type: 'text[]' },
      window_start_local: { type: 'time without time zone' },
      window_end_local: { type: 'time without time zone' },
      blackout_dates: { type: 'date[]' },
      preorder_lead_hours: { type: 'integer' },

      // Delivery
      delivery_zone_ids: { type: 'uuid[]' },

      // Usage limits
      is_usage_limit_per_user: { type: 'boolean', default: false },
      usage_limit_per_customer: { type: 'integer' },
      is_usage_limit_total: { type: 'boolean', default: false },
      usage_limit_total: { type: 'integer' },
      is_daily_usage_limit: { type: 'boolean', default: false },
      daily_usage_limit: { type: 'integer' },

      max_discount_percent: { type: 'numeric(5,2)' },
      extra_json: { type: 'jsonb' },
      status: { type: 'text', default: "'DRAFT'" },
      created_at: { type: 'timestamp', default: pgm.func('now()') },
      updated_at: { type: 'timestamp', default: pgm.func('now()') },
      deleted_at: { type: 'timestamp' },
    },
    { ifNotExists: true },
  );

  // FK: promotion_id -> promotions
  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE promotion_eligibility
        ADD CONSTRAINT promotion_eligibility_promotion_id_fkey
        FOREIGN KEY (promotion_id) REFERENCES promotions(id)
        ON UPDATE NO ACTION ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  pgm.sql(`
    CREATE OR REPLACE TRIGGER trigger_promotion_eligibility_updated
      BEFORE UPDATE ON promotion_eligibility
      FOR EACH ROW
      EXECUTE FUNCTION update_promotion_eligibility_updated_at();
  `);

  // ── promotion_eligibility_staging ────────────────────────────
  pgm.createTable(
    'promotion_eligibility_staging',
    {
      id: {
        type: 'uuid',
        primaryKey: true,
        default: pgm.func('gen_random_uuid()'),
        notNull: true,
      },
      promotion_id: { type: 'uuid', notNull: true },
      promotion_eligibility_id: { type: 'uuid', notNull: true },

      // Minimum order value
      is_minimum_order_value: { type: 'boolean', default: false },
      min_order_minor: { type: 'bigint' },

      // Minimum items
      is_minimum_items: { type: 'boolean', default: false },
      min_items: { type: 'integer' },

      // Minimum previous orders
      is_minimum_previous_order: { type: 'boolean', default: false },
      min_previous_orders: { type: 'integer' },

      // Inactive days
      is_inactive_days: { type: 'boolean', default: false },
      inactive_days: { type: 'integer' },

      // Time window
      days_of_week: { type: 'text[]' },
      window_start_local: { type: 'time without time zone' },
      window_end_local: { type: 'time without time zone' },
      blackout_dates: { type: 'date[]' },
      preorder_lead_hours: { type: 'integer' },

      // Delivery
      delivery_zone_ids: { type: 'uuid[]' },

      // Usage limits
      is_usage_limit_per_user: { type: 'boolean', default: false },
      usage_limit_per_customer: { type: 'integer' },
      is_usage_limit_total: { type: 'boolean', default: false },
      usage_limit_total: { type: 'integer' },
      is_daily_usage_limit: { type: 'boolean', default: false },
      daily_usage_limit: { type: 'integer' },

      max_discount_percent: { type: 'numeric(5,2)' },
      extra_json: { type: 'jsonb' },
      status: { type: 'text', default: "'DRAFT'" },
      created_at: { type: 'timestamp', default: pgm.func('now()') },
      updated_at: { type: 'timestamp', default: pgm.func('now()') },
      deleted_at: { type: 'timestamp' },
    },
    { ifNotExists: true },
  );

  // FK: promotion_eligibility_id -> promotion_eligibility
  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE promotion_eligibility_staging
        ADD CONSTRAINT promotion_eligibility_staging_fkey
        FOREIGN KEY (promotion_eligibility_id) REFERENCES promotion_eligibility(id)
        ON UPDATE NO ACTION ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  pgm.sql(`
    CREATE OR REPLACE TRIGGER trigger_promotion_eligibility_staging_updated
      BEFORE UPDATE ON promotion_eligibility_staging
      FOR EACH ROW
      EXECUTE FUNCTION update_promotion_eligibility_staging_updated_at();
  `);
};

exports.down = (pgm) => {
  pgm.sql(`DROP TRIGGER IF EXISTS trigger_promotion_eligibility_staging_updated ON promotion_eligibility_staging`);
  pgm.dropTable('promotion_eligibility_staging', { ifExists: true, cascade: true });
  pgm.sql(`DROP TRIGGER IF EXISTS trigger_promotion_eligibility_updated ON promotion_eligibility`);
  pgm.dropTable('promotion_eligibility', { ifExists: true, cascade: true });
  pgm.sql(`DROP FUNCTION IF EXISTS update_promotion_eligibility_staging_updated_at()`);
  pgm.sql(`DROP FUNCTION IF EXISTS update_promotion_eligibility_updated_at()`);
};
