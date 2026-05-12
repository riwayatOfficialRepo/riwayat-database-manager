exports.up = (pgm) => {
  pgm.sql(`
    ALTER TABLE dishes
      ADD COLUMN IF NOT EXISTS display_name varchar(255) NULL;
  `);

  pgm.sql(`
    ALTER TABLE dishes_staging
      ADD COLUMN IF NOT EXISTS display_name varchar(255) NULL;
  `);
};

exports.down = (pgm) => {
  pgm.sql(`ALTER TABLE dishes DROP COLUMN IF EXISTS display_name`);
  pgm.sql(`ALTER TABLE dishes_staging DROP COLUMN IF EXISTS display_name`);
};
