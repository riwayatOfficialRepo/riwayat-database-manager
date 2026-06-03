exports.up = (pgm) => {
  // Rename has_food_liscense (typo) -> has_food_license on existing DBs
  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE kitchens RENAME COLUMN has_food_liscense TO has_food_license;
    EXCEPTION WHEN undefined_column THEN NULL;
    END $$;
  `);
  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE kitchens_staging RENAME COLUMN has_food_liscense TO has_food_license;
    EXCEPTION WHEN undefined_column THEN NULL;
    END $$;
  `);

  // Defect 3: doc_expiry_date for kitchen_user_docs
  pgm.sql(`ALTER TABLE kitchen_user_docs ADD COLUMN IF NOT EXISTS doc_expiry_date date`);
};

exports.down = (pgm) => {
  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE kitchens RENAME COLUMN has_food_license TO has_food_liscense;
    EXCEPTION WHEN undefined_column THEN NULL;
    END $$;
  `);
  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE kitchens_staging RENAME COLUMN has_food_license TO has_food_liscense;
    EXCEPTION WHEN undefined_column THEN NULL;
    END $$;
  `);

  pgm.sql(`ALTER TABLE kitchen_user_docs DROP COLUMN IF EXISTS doc_expiry_date`);
};
