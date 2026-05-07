exports.up = (pgm) => {
  pgm.sql(`
    ALTER TABLE kitchen_users
      ADD COLUMN IF NOT EXISTS business_reference varchar(255) NULL;
  `);

  pgm.sql(`
    ALTER TABLE admin_users
      ADD COLUMN IF NOT EXISTS business_reference varchar(255) NULL;
  `);

  pgm.sql(`
    ALTER TABLE change_requests
      ADD COLUMN IF NOT EXISTS business_reference varchar(255) NULL;
  `);

  pgm.sql(`
    ALTER TABLE dishes
      ADD COLUMN IF NOT EXISTS business_reference varchar(255) NULL;
  `);

  pgm.sql(`
    ALTER TABLE dishes_staging
      ADD COLUMN IF NOT EXISTS business_reference varchar(255) NULL;
  `);
};

exports.down = (pgm) => {
  pgm.sql(`ALTER TABLE kitchen_users DROP COLUMN IF EXISTS business_reference`);
  pgm.sql(`ALTER TABLE admin_users DROP COLUMN IF EXISTS business_reference`);
  pgm.sql(`ALTER TABLE change_requests DROP COLUMN IF EXISTS business_reference`);
  pgm.sql(`ALTER TABLE dishes DROP COLUMN IF EXISTS business_reference`);
  pgm.sql(`ALTER TABLE dishes_staging DROP COLUMN IF EXISTS business_reference`);
};
