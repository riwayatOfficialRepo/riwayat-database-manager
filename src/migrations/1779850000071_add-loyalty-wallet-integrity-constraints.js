// For riwayat-database-manager — copy into its src/migrations/ and run there,
// AFTER 1779850000070 (needs the deleted_at column).
//
// Database-level backstops for rules the module already enforces under a
// wallet row lock:
//   - one award per source (e.g. 'order:ORD-1') per wallet → no double credit
//   - a wallet balance never goes negative
//
// Both fail if existing data already breaks them. Run the pre-checks in
// migrations/README.md first.

exports.up = (pgm) => {
  pgm.createIndex('loyalty_awards', ['wallet_account_id', 'award_source_id'], {
    name: 'uq_loyalty_awards_wallet_source',
    unique: true,
    where: 'deleted_at IS NULL',
    ifNotExists: true,
  });

  pgm.addConstraint('wallet_accounts', 'wallet_accounts_balance_points_check', {
    check: 'balance_points >= 0',
  });
};

exports.down = (pgm) => {
  pgm.dropConstraint('wallet_accounts', 'wallet_accounts_balance_points_check', { ifExists: true });
  pgm.dropIndex('loyalty_awards', ['wallet_account_id', 'award_source_id'], {
    name: 'uq_loyalty_awards_wallet_source',
    ifExists: true,
  });
};
