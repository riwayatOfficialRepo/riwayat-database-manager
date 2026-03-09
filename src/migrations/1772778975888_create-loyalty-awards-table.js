exports.up = (pgm) => {
  // Create loyalty_awards table
  pgm.createTable('loyalty_awards', {
    award_id: {
      type: 'bigserial', // auto-creates loyalty_awards_award_id_seq
      notNull: true,
      primaryKey: true,
    },
    wallet_account_id: { type: 'bigint', notNull: true },
    award_type: { type: 'varchar(30)', notNull: true },
    award_source_id: { type: 'varchar(100)', notNull: true },
    order_id: { type: 'varchar(50)' },
    points_earned: { type: 'numeric(12,2)', notNull: true },
    remaining_points: { type: 'numeric(12,2)', notNull: true },
    status: { type: 'varchar(20)', notNull: true, default: 'active' },
    expires_at: { type: 'timestamp' },
    rule_version: { type: 'varchar(20)' },
    rule_snapshot: { type: 'jsonb' },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('now()') },
  }, { ifNotExists: true });

  // FK to wallet_accounts is in a separate later migration (1773200000000)
  // because wallet_accounts (1772779483588) sorts after this file

  // Add checks
  pgm.addConstraint('loyalty_awards', 'loyalty_awards_points_earned_check', {
    check: 'points_earned > 0'
  });

  pgm.addConstraint('loyalty_awards', 'loyalty_awards_remaining_points_check', {
    check: 'remaining_points >= 0'
  });
};

exports.down = (pgm) => {
  pgm.dropTable('loyalty_awards', { ifExists: true });
};