exports.up = (pgm) => {
  // Rename customer_small_id column to customer_display_id (if it exists)
  // This migration is safe to run even if the column was already created as customer_display_id
  pgm.sql(`
    DO $$ 
    BEGIN
      IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'customer' 
          AND column_name = 'customer_small_id'
      ) THEN
        ALTER TABLE customer RENAME COLUMN customer_small_id TO customer_display_id;
      END IF;
    END $$;
  `);
};

exports.down = (pgm) => {
  // Revert: rename customer_display_id back to customer_small_id (if customer_display_id exists)
  pgm.sql(`
    DO $$ 
    BEGIN
      IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'customer' 
          AND column_name = 'customer_display_id'
      ) AND NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'customer' 
          AND column_name = 'customer_small_id'
      ) THEN
        ALTER TABLE customer RENAME COLUMN customer_display_id TO customer_small_id;
      END IF;
    END $$;
  `);
};
