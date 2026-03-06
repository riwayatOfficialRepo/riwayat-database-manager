exports.up = (pgm) => {
  pgm.createTable('loyalty_limits', {
    id: {
      type: 'bigint',
      notNull: true,
      primaryKey: true,
      // Identity column
      autoIncrement: true,
    },
    earn_rate_cap: { type: 'double precision' },
    max_points_per_order: { type: 'bigint' },
    max_points_per_day: { type: 'bigint' },
    max_points_per_month: { type: 'bigint' },
    created_at: { type: 'timestamp' },
    updated_at: { type: 'timestamp' },
  }, { ifNotExists: true });
};

exports.down = (pgm) => {
  pgm.dropTable('loyalty_limits', { ifExists: true });
};