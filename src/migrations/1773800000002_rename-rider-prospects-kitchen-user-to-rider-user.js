/**
 * If an older revision created rider_prospects.kitchen_user_id, rename to rider_user_id.
 * Safe no-op when column is already rider_user_id or table is missing.
 */
exports.up = (pgm) => {
  pgm.sql(`
    DO $$ BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'rider_prospects'
          AND column_name = 'kitchen_user_id'
      ) THEN
        DROP INDEX IF EXISTS idx_rider_prospects_kitchen_user;
        ALTER TABLE rider_prospects RENAME COLUMN kitchen_user_id TO rider_user_id;
      END IF;
    END $$;
  `);
  pgm.createIndex("rider_prospects", "rider_user_id", {
    name: "idx_rider_prospects_rider_user",
    ifNotExists: true,
  });
};

exports.down = (pgm) => {
  pgm.sql(`
    DO $$ BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'rider_prospects'
          AND column_name = 'rider_user_id'
      ) THEN
        DROP INDEX IF EXISTS idx_rider_prospects_rider_user;
        ALTER TABLE rider_prospects RENAME COLUMN rider_user_id TO kitchen_user_id;
      END IF;
    END $$;
  `);
  pgm.createIndex("rider_prospects", "kitchen_user_id", {
    name: "idx_rider_prospects_kitchen_user",
    ifNotExists: true,
  });
};
