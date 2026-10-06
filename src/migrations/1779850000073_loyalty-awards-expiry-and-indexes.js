// For riwayat-database-manager — copy into its src/migrations/ and run there,
// AFTER 1779850000070 (deleted_at) and 1779850000072 (timestamptz).
//
// - Every award must expire: expires_at NOT NULL. The module always sets it
//   (caller value or now + the wallet policy's expiry days). Clean any NULL
//   rows first (see migrations/README.md) or this step fails.
// - Indexes for the module's hot queries (loyalty_awards has only its primary key):
//     * expiry job:       active awards with points left, by expiry date
//     * redemption FIFO:  a wallet's active awards, soonest expiry first
//     * daily/monthly limits: a wallet's awards by type and creation time

exports.up = (pgm) => {
  pgm.alterColumn('loyalty_awards', 'expires_at', { notNull: true });

  pgm.createIndex('loyalty_awards', ['expires_at'], {
    name: 'idx_loyalty_awards_expiry_due',
    where: "status = 'active' AND remaining_points > 0 AND deleted_at IS NULL",
    ifNotExists: true,
  });

  pgm.createIndex('loyalty_awards', ['wallet_account_id', 'expires_at'], {
    name: 'idx_loyalty_awards_wallet_active',
    where: "status = 'active' AND deleted_at IS NULL",
    ifNotExists: true,
  });

  pgm.createIndex('loyalty_awards', ['wallet_account_id', 'award_type', 'created_at'], {
    name: 'idx_loyalty_awards_wallet_type_created',
    where: 'deleted_at IS NULL',
    ifNotExists: true,
  });
};

exports.down = (pgm) => {
  pgm.dropIndex('loyalty_awards', [], { name: 'idx_loyalty_awards_wallet_type_created', ifExists: true });
  pgm.dropIndex('loyalty_awards', [], { name: 'idx_loyalty_awards_wallet_active', ifExists: true });
  pgm.dropIndex('loyalty_awards', [], { name: 'idx_loyalty_awards_expiry_due', ifExists: true });
  pgm.alterColumn('loyalty_awards', 'expires_at', { notNull: false });
};
