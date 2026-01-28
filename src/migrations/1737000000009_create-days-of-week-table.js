exports.up = (pgm) => {
  pgm.createTable('days_of_week', {
    id: { type: 'char(3)', primaryKey: true },
    name: { type: 'text', notNull: true, unique: true },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('days_of_week');
};
