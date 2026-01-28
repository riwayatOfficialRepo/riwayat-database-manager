exports.up = (pgm) => {
  pgm.createTable('kitchen_availability_staging', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('uuid_generate_v4()'),
    },
    kitchen_availability_id: {
      type: 'uuid',
      references: 'kitchen_availability(id)',
    },
    kitchen_staging_id: {
      type: 'uuid',
      references: 'kitchens_staging(id)',
    },
    day_of_week_id: {
      type: 'char(3)',
      references: 'days_of_week(id)',
    },
    slot_id: {
      type: 'integer',
      references: 'kitchen_availability_slots(id)',
    },
    is_available: { type: 'boolean', default: false },
    custom_start_time: { type: 'time' },
    custom_end_time: { type: 'time' },
    created_at: { type: 'timestamp', default: pgm.func('now()') },
    updated_at: { type: 'timestamp', default: pgm.func('now()') },
    status: { type: 'varchar(20)', default: 'draft' },
    is_record_changed: { type: 'boolean', default: false },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('kitchen_availability_staging');
};
