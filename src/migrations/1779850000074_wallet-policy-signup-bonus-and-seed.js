// For riwayat-database-manager — copy into its src/migrations/ and run there.
//
// The module now reads its wallet policy from the latest wallet_policy row
// (falling back to config/defaults/walletPolicy.json if it can't). This adds
// what the table is missing, guards the values, and seeds the first row with
// the same values as walletPolicy.json when the table has no live row.
//
//   expiry_days              → default points expiry (days)       [existing]
//   max_redeem_cap           → most points per redemption, NULL = no cap [existing]
//   signup_bonus_enabled     → grant a bonus when a wallet opens   [new]
//   signup_bonus_points      → bonus points                        [new]
//   signup_bonus_expiry_days → days until the bonus expires        [new]
//   deleted_at               → soft delete, like the other tables  [new]

exports.up = (pgm) => {
  pgm.addColumns(
    'wallet_policy',
    {
      signup_bonus_enabled: { type: 'boolean', notNull: true, default: false },
      signup_bonus_points: { type: 'numeric(12,2)' },
      signup_bonus_expiry_days: { type: 'integer' },
      deleted_at: { type: 'timestamptz' },
    },
    { ifNotExists: true },
  );

  pgm.addConstraint('wallet_policy', 'wallet_policy_expiry_days_check', {
    check: 'expiry_days > 0',
  });
  pgm.addConstraint('wallet_policy', 'wallet_policy_max_redeem_cap_check', {
    check: 'max_redeem_cap IS NULL OR max_redeem_cap > 0',
  });
  pgm.addConstraint('wallet_policy', 'wallet_policy_signup_bonus_check', {
    check: 'NOT signup_bonus_enabled OR (signup_bonus_points > 0 AND signup_bonus_expiry_days > 0)',
  });

  pgm.sql(`
    INSERT INTO wallet_policy (id, expiry_days, max_redeem_cap, signup_bonus_enabled, signup_bonus_points, signup_bonus_expiry_days)
    OVERRIDING SYSTEM VALUE
    SELECT COALESCE((SELECT MAX(id) FROM wallet_policy), 0) + 1, 90, 500, true, 50, 365
    WHERE NOT EXISTS (SELECT 1 FROM wallet_policy WHERE deleted_at IS NULL);
  `);
};

exports.down = (pgm) => {
  pgm.dropConstraint('wallet_policy', 'wallet_policy_signup_bonus_check', { ifExists: true });
  pgm.dropConstraint('wallet_policy', 'wallet_policy_max_redeem_cap_check', { ifExists: true });
  pgm.dropConstraint('wallet_policy', 'wallet_policy_expiry_days_check', { ifExists: true });
  pgm.dropColumns('wallet_policy', ['deleted_at', 'signup_bonus_expiry_days', 'signup_bonus_points', 'signup_bonus_enabled'], { ifExists: true });
};
