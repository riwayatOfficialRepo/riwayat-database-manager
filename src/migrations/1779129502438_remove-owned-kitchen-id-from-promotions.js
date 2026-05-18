exports.up = (pgm) => {
  pgm.dropColumn('promotions', 'owned_kitchen_id', { ifExists: true });
  pgm.dropColumn('promotions_staging', 'owned_kitchen_id', { ifExists: true });
};

exports.down = (pgm) => {
  pgm.addColumn('promotions', {
    owned_kitchen_id: { type: 'uuid' },
  });
  pgm.addColumn('promotions_staging', {
    owned_kitchen_id: { type: 'uuid' },
  });
};
