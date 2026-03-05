exports.up = (pgm) => {
  pgm.addColumn('customer', {
    identity: {
      type: 'varchar(20)',
      notNull: true,
      default: 'CUSTOMER',
    },
  });
};

exports.down = (pgm) => {
  pgm.dropColumn('customer', 'identity');
};
