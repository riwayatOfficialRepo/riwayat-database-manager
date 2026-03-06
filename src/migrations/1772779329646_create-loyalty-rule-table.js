exports.up = (pgm) => {
  pgm.createTable('loyalty_rules', {
    id: {
      type: 'bigint',
      notNull: true,
      primaryKey: true,
      autoIncrement: true, // GENERATED ALWAYS AS IDENTITY
    },
    rule: { type: 'json' },
    version: { type: 'varchar' },
  }, { ifNotExists: true });
};

exports.down = (pgm) => {
  pgm.dropTable('loyalty_rules', { ifExists: true });
};