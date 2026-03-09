exports.up = (pgm) => {
  // Restored: this file must exist because some DBs have it in pgmigrations.
  // Uses ifNotExists so it is a no-op if wallet_accounts was already created.
  pgm.createTable('wallet_accounts', {
    wallet_account_id: {
      type: 'bigserial', // auto-creates wallet_accounts_wallet_account_id_seq
      notNull: true,
      primaryKey: true,
    },
    customer_id: { type: 'varchar(50)', notNull: true, unique: true },
    balance_points: { type: 'numeric(12,2)', notNull: true, default: 0 },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('now()') },
  }, { ifNotExists: true });

  pgm.sql('CREATE INDEX IF NOT EXISTS idx_wallet_accounts_customer_id ON wallet_accounts (customer_id)');
};

exports.down = (pgm) => {
  pgm.dropTable('wallet_accounts', { ifExists: true });
};
