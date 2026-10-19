// For riwayat-database-manager — copy into its src/migrations/ and run there.
// Adds soft-delete support required by this module: every repository read
// filters `deleted_at IS NULL`. Must be applied before this module version is
// deployed.

const TABLES = ['wallet_accounts', 'wallet_ledger', 'loyalty_awards', 'loyalty_rules', 'loyalty_exclusions'];

exports.up = (pgm) => {
  TABLES.forEach((table) => {
    // timestamptz, like the tables' other timestamps: an exact moment, stored in UTC
    pgm.addColumn(table, { deleted_at: { type: 'timestamptz' } }, { ifNotExists: true });
  });
};

exports.down = (pgm) => {
  TABLES.forEach((table) => {
    pgm.dropColumn(table, 'deleted_at', { ifExists: true });
  });
};
