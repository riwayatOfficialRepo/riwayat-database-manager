exports.up = (pgm) => {
  // Create loyalty_exclusions table
  pgm.createTable('loyalty_exclusions', {
    exclusion_id: {
      type: 'bigint',
      notNull: true,
      primaryKey: true,
      default: pgm.func("nextval('loyalty_exclusions_exclusion_id_seq')"),
    },
    exclusion_type: { type: 'varchar(50)', notNull: true },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('now()') },
    reason: { type: 'varchar' },
    exclusion_value: { type: 'varchar' },
    exclusion_expires_at: { type: 'timestamp with time zone' },
    status: { type: 'varchar' },
  }, { ifNotExists: true });
};

exports.down = (pgm) => {
  pgm.dropTable('loyalty_exclusions', { ifExists: true });
};