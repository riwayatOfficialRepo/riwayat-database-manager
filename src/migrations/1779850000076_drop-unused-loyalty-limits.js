// For riwayat-database-manager — copy into its src/migrations/ and run there.
//
// loyalty_limits duplicated the limits that live in the loyalty_rules JSON
// (max_points_per_order / _day / _month, earn_rate_cap) and was never read by
// the module. The limits stay in loyalty_rules, versioned with the rules and
// recorded in each award's rule_snapshot.

exports.up = (pgm) => {
  pgm.dropTable('loyalty_limits', { ifExists: true });
};

// Recreates the table's structure (not its rows) so the migration can be rolled back.
exports.down = (pgm) => {
  pgm.createTable('loyalty_limits', {
    id: { type: 'bigint', notNull: true, primaryKey: true },
    earn_rate_cap: { type: 'double precision' },
    max_points_per_order: { type: 'bigint' },
    max_points_per_day: { type: 'bigint' },
    max_points_per_month: { type: 'bigint' },
    created_at: { type: 'timestamp' },
    updated_at: { type: 'timestamp' },
  }, { ifNotExists: true });
};
