exports.up = (pgm) => {
  pgm.createTable('days_of_week', {
    id: { type: 'char(3)', primaryKey: true },
    name: { type: 'text', notNull: true },
  }, { ifNotExists: true });

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE days_of_week ADD CONSTRAINT days_of_week_name_key UNIQUE (name);
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);
};

exports.down = (pgm) => {
  pgm.dropTable('days_of_week', { ifExists: true });
};
