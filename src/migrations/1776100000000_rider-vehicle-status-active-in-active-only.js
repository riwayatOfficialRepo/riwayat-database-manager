/**
 * Enforce rider_vehicle.status to only allow: active, in_active.
 */
exports.up = (pgm) => {
  pgm.sql(`
    UPDATE rider_vehicle
    SET status = CASE
      WHEN LOWER(TRIM(status)) = 'active' THEN 'active'
      WHEN LOWER(TRIM(status)) IN ('in_active', 'inactive') THEN 'in_active'
      ELSE 'in_active'
    END
    WHERE status IS NOT NULL;
  `);

  pgm.sql(`
    ALTER TABLE rider_vehicle
    ALTER COLUMN status TYPE text,
    ALTER COLUMN status SET NOT NULL,
    ALTER COLUMN status SET DEFAULT 'in_active';
  `);

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE rider_vehicle
        DROP CONSTRAINT IF EXISTS rider_vehicle_status_check;
    EXCEPTION WHEN undefined_object THEN NULL;
    END $$;
  `);

  pgm.sql(`
    ALTER TABLE rider_vehicle
    ADD CONSTRAINT rider_vehicle_status_check
    CHECK (status IN ('active', 'in_active'));
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE rider_vehicle
        DROP CONSTRAINT IF EXISTS rider_vehicle_status_check;
    EXCEPTION WHEN undefined_object THEN NULL;
    END $$;
  `);

  pgm.sql(`
    ALTER TABLE rider_vehicle
    ALTER COLUMN status SET DEFAULT 'active';
  `);
};
