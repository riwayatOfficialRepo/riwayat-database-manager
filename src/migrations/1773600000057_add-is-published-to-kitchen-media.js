exports.up = (pgm) => {
  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE kitchen_media ADD COLUMN is_published boolean NOT NULL DEFAULT false;
    EXCEPTION WHEN duplicate_column THEN NULL;
    END $$;
  `);
};

exports.down = (pgm) => {
  pgm.dropColumn('kitchen_media', 'is_published', { ifExists: true });
};
