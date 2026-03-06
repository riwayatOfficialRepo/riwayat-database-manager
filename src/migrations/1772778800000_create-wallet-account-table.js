exports.up = (pgm) => {
  // Create table — must run before loyalty_awards which has FK to wallet_accounts
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

  // Create index on customer_id
  pgm.createIndex('wallet_accounts', 'customer_id', {
    ifNotExists: true,
    name: 'idx_wallet_accounts_customer_id',
  });
};

exports.down = (pgm) => {
  pgm.dropIndex('wallet_accounts', 'customer_id', { ifExists: true });
  pgm.dropTable('wallet_accounts', { ifExists: true });
};
