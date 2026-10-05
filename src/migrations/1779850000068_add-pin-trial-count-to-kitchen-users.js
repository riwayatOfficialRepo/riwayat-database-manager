exports.up = (pgm) => {
  pgm.addColumn('kitchen_users', {
    pin_trial_count: { type: 'integer', notNull: true, default: 0 },
  });
};

exports.down = (pgm) => {
  pgm.dropColumn('kitchen_users', 'pin_trial_count');
};
