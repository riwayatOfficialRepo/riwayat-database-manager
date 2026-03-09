exports.up = (pgm) => {
  // Create table
  pgm.createTable('wallet_ledger', {
    ledger_id: {
      type: 'bigserial', // auto-creates wallet_ledger_ledger_id_seq
      notNull: true,
      primaryKey: true,
    },
    wallet_account_id: { type: 'bigint', notNull: true },
    award_id: { type: 'bigint' },
    transaction_type: { type: 'varchar(20)', notNull: true },
    points: { type: 'numeric(12,2)', notNull: true },
    reason: { type: 'varchar(50)', notNull: true },
    redemption_request_id: { type: 'varchar(100)', unique: true },
    correlation_id: { type: 'varchar(100)' },
    metadata: { type: 'jsonb' },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('now()') },
  }, { ifNotExists: true });

  // Foreign keys
  pgm.addConstraint('wallet_ledger', 'wallet_ledger_award_id_fkey', {
    foreignKeys: {
      columns: 'award_id',
      references: 'loyalty_awards(award_id)',
      onUpdate: 'NO ACTION',
      onDelete: 'NO ACTION',
    },
  });

  // wallet_account_id FK is added in 1773500000002 (after wallet_accounts is created)

  // Indexes
  pgm.createIndex('wallet_ledger', 'award_id', { ifNotExists: true, name: 'idx_wallet_ledger_award' });
  pgm.createIndex('wallet_ledger', 'wallet_account_id', { ifNotExists: true, name: 'idx_wallet_ledger_wallet_account' });
};

exports.down = (pgm) => {
  // Drop indexes first
  pgm.dropIndex('wallet_ledger', 'award_id', { ifExists: true });
  pgm.dropIndex('wallet_ledger', 'wallet_account_id', { ifExists: true });

  // Drop table
  pgm.dropTable('wallet_ledger', { ifExists: true });
};