exports.up = (pgm) => {
  pgm.addColumns('kitchen_roles', {
    deleted_at: { type: 'timestamp' },
  }, { ifNotExists: true });
};

exports.down = (pgm) => {
  pgm.dropColumns('kitchen_roles', ['deleted_at'], { ifExists: true });
};
