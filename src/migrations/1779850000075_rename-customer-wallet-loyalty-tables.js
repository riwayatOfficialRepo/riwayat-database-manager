// For riwayat-database-manager — copy into its src/migrations/ and run there,
// LAST of this module's migrations (022–026 are written against the old names).
//
// Customer-owned wallet/loyalty tables get the customer_ prefix, leaving room
// for separate kitchen_ and rider_ point systems later. Global configuration
// tables (wallet_policy, loyalty_rules, loyalty_exclusions) keep their names.
//
// Postgres keeps constraints, indexes, sequences and foreign keys attached
// through a rename; only the table names change.

const RENAMES = [
  ['wallet_accounts', 'customer_wallet_accounts'],
  ['wallet_ledger', 'customer_wallet_ledger'],
  ['loyalty_awards', 'customer_loyalty_awards'],
];

exports.up = (pgm) => {
  RENAMES.forEach(([from, to]) => pgm.renameTable(from, to));
};

exports.down = (pgm) => {
  RENAMES.forEach(([from, to]) => pgm.renameTable(to, from));
};
