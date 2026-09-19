exports.up = (pgm) => {
  pgm.addColumn('variant_inventory_daily', {
    total_quantity: { type: 'integer' },
  });
};

exports.down = (pgm) => {
  pgm.dropColumn('variant_inventory_daily', 'total_quantity');
};
