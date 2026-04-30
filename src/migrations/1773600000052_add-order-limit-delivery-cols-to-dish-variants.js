/**
 * Migration: Add order limit and fixed delivery columns to dish_variants and dish_variants_staging
 */

exports.up = (pgm) => {
  // ── dish_variants ────────────────────────────────────────────
  pgm.sql(`
    ALTER TABLE dish_variants
      ADD COLUMN IF NOT EXISTS is_max_order_limit boolean DEFAULT false,
      ADD COLUMN IF NOT EXISTS max_order_limit integer,
      ADD COLUMN IF NOT EXISTS is_min_order_limit boolean DEFAULT false,
      ADD COLUMN IF NOT EXISTS min_order_limit integer,
      ADD COLUMN IF NOT EXISTS is_min_order_limit_standalone boolean DEFAULT false,
      ADD COLUMN IF NOT EXISTS allow_customer_preferred_date boolean DEFAULT false,
      ADD COLUMN IF NOT EXISTS fixed_delivery_day char(3),
      ADD COLUMN IF NOT EXISTS fixed_delivery_slot integer,
      ADD COLUMN IF NOT EXISTS is_fixed_delivery boolean DEFAULT false;
  `);

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE dish_variants ADD CONSTRAINT dish_variants_fixed_delivery_day_fkey
        FOREIGN KEY (fixed_delivery_day) REFERENCES days_of_week(id)
        ON UPDATE NO ACTION ON DELETE SET NULL;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE dish_variants ADD CONSTRAINT dish_variants_fixed_delivery_slot_fkey
        FOREIGN KEY (fixed_delivery_slot) REFERENCES kitchen_availability_slots(id)
        ON UPDATE NO ACTION ON DELETE SET NULL;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  // ── dish_variants_staging ────────────────────────────────────
  pgm.sql(`
    ALTER TABLE dish_variants_staging
      ADD COLUMN IF NOT EXISTS is_max_order_limit boolean DEFAULT false,
      ADD COLUMN IF NOT EXISTS max_order_limit integer,
      ADD COLUMN IF NOT EXISTS is_min_order_limit boolean DEFAULT false,
      ADD COLUMN IF NOT EXISTS min_order_limit integer,
      ADD COLUMN IF NOT EXISTS is_min_order_limit_standalone boolean DEFAULT false,
      ADD COLUMN IF NOT EXISTS allow_customer_preferred_date boolean DEFAULT false,
      ADD COLUMN IF NOT EXISTS fixed_delivery_day char(3),
      ADD COLUMN IF NOT EXISTS fixed_delivery_slot integer,
      ADD COLUMN IF NOT EXISTS is_fixed_delivery boolean DEFAULT false;
  `);

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE dish_variants_staging ADD CONSTRAINT dish_variants_staging_fixed_delivery_day_fkey
        FOREIGN KEY (fixed_delivery_day) REFERENCES days_of_week(id)
        ON UPDATE NO ACTION ON DELETE SET NULL;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE dish_variants_staging ADD CONSTRAINT dish_variants_staging_fixed_delivery_slot_fkey
        FOREIGN KEY (fixed_delivery_slot) REFERENCES kitchen_availability_slots(id)
        ON UPDATE NO ACTION ON DELETE SET NULL;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    ALTER TABLE dish_variants_staging
      DROP CONSTRAINT IF EXISTS dish_variants_staging_fixed_delivery_slot_fkey,
      DROP CONSTRAINT IF EXISTS dish_variants_staging_fixed_delivery_day_fkey,
      DROP COLUMN IF EXISTS is_max_order_limit,
      DROP COLUMN IF EXISTS max_order_limit,
      DROP COLUMN IF EXISTS is_min_order_limit,
      DROP COLUMN IF EXISTS min_order_limit,
      DROP COLUMN IF EXISTS is_min_order_limit_standalone,
      DROP COLUMN IF EXISTS allow_customer_preferred_date,
      DROP COLUMN IF EXISTS fixed_delivery_day,
      DROP COLUMN IF EXISTS fixed_delivery_slot,
      DROP COLUMN IF EXISTS is_fixed_delivery;
  `);

  pgm.sql(`
    ALTER TABLE dish_variants
      DROP CONSTRAINT IF EXISTS dish_variants_fixed_delivery_slot_fkey,
      DROP CONSTRAINT IF EXISTS dish_variants_fixed_delivery_day_fkey,
      DROP COLUMN IF EXISTS is_max_order_limit,
      DROP COLUMN IF EXISTS max_order_limit,
      DROP COLUMN IF EXISTS is_min_order_limit,
      DROP COLUMN IF EXISTS min_order_limit,
      DROP COLUMN IF EXISTS is_min_order_limit_standalone,
      DROP COLUMN IF EXISTS allow_customer_preferred_date,
      DROP COLUMN IF EXISTS fixed_delivery_day,
      DROP COLUMN IF EXISTS fixed_delivery_slot,
      DROP COLUMN IF EXISTS is_fixed_delivery;
  `);
};
