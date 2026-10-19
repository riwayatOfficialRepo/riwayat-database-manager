exports.up = (pgm) => {
  const tables = ['promotions', 'promotions_staging'];

  for (const table of tables) {
    pgm.sql(`
      ALTER TABLE ${table}
        ADD COLUMN IF NOT EXISTS owned_by_id     UUID,
        ADD COLUMN IF NOT EXISTS owned_by_detail JSONB
    `);
  }
};

exports.down = (pgm) => {
  const tables = ['promotions', 'promotions_staging'];

  for (const table of tables) {
    pgm.sql(`
      ALTER TABLE ${table}
        DROP COLUMN IF EXISTS owned_by_id,
        DROP COLUMN IF EXISTS owned_by_detail
    `);
  }
};
