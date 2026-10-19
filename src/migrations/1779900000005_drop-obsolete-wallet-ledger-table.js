// wallet_ledger is obsolete: the customer wallet ledger lives in
// customer_wallet_ledger (renamed in 1779850000075). Drops any leftover
// wallet_ledger table so nothing reads or writes the old name.

exports.up = (pgm) => {
  pgm.dropTable('wallet_ledger', { ifExists: true, cascade: true });
};

// Recreates the table's structure (not its rows) so the migration can be rolled back.
// Indexes and foreign keys are left out: their original names
// (idx_wallet_ledger_*, wallet_ledger_*_fkey) now belong to customer_wallet_ledger.
exports.down = (pgm) => {
  pgm.createTable('wallet_ledger', {
    ledger_id: { type: 'bigserial', notNull: true, primaryKey: true },
    wallet_account_id: { type: 'bigint', notNull: true },
    award_id: { type: 'bigint' },
    transaction_type: { type: 'varchar(20)', notNull: true },
    points: { type: 'numeric(12,2)', notNull: true },
    reason: { type: 'varchar(50)', notNull: true },
    redemption_request_id: { type: 'varchar(100)', unique: true },
    correlation_id: { type: 'varchar(100)' },
    metadata: { type: 'jsonb' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    deleted_at: { type: 'timestamptz' },
  }, { ifNotExists: true });
};
