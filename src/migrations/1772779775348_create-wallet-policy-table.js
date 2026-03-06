exports.up = (pgm) => {
  pgm.createTable('wallet_policy', {
    id: {
      type: 'bigint',
      notNull: true,
      primaryKey: true,
      identity: { always: true },
    },
    refund_to_wallet: { type: 'boolean' },
    expiry_days: { type: 'bigint' },
    max_redeem_cap: { type: 'bigint' },
  }, { ifNotExists: true });
};

exports.down = (pgm) => {
  pgm.dropTable('wallet_policy', { ifExists: true });
};