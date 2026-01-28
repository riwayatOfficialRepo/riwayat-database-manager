exports.up = (pgm) => {
  pgm.createTable('kitchen_availability_slots', {
    id: { type: 'serial', primaryKey: true },
    name: { type: 'text', notNull: true, unique: true },
    label_key: { type: 'text', notNull: true },
    default_start_time: { type: 'time' },
    default_end_time: { type: 'time' },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('kitchen_availability_slots');
};
