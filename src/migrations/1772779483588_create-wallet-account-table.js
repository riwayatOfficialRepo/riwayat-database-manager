exports.up = (pgm) => {
  // Create table
  pgm.createTable('wallet_accounts', {
    wallet_account_id: {
      type: 'bigint',
      notNull: true,
      primaryKey: true,
      default: pgm.func("nextval('wallet_accounts_wallet_account_id_seq'::regclass)"),
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
  // Drop index first
  pgm.dropIndex('wallet_accounts', 'customer_id', { ifExists: true });
  // Drop table
  pgm.dropTable('wallet_accounts', { ifExists: true });
};