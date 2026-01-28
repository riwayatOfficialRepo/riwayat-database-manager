exports.up = (pgm) => {
  pgm.createTable('kitchen_addresses', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('uuid_generate_v4()'),
    },
    kitchen_id: {
      type: 'uuid',
      notNull: true,
      references: 'kitchens(id)',
      onDelete: 'CASCADE',
    },
    address_name: { type: 'text' },
    address_line1: { type: 'text' },
    address_line2: { type: 'text' },
    city: { type: 'text' },
    state: { type: 'text' },
    zone: { type: 'text' },
    postal_code: { type: 'text' },
    country: { type: 'text' },
    nearest_location: { type: 'text' },
    delivery_instruction: { type: 'text' },
    latitude: { type: 'numeric(9,6)' },
    longitude: { type: 'numeric(9,6)' },
    place_id: { type: 'text' },
    formatted_address: { type: 'text' },
    map_link: { type: 'text' },
    created_at: { type: 'timestamp', default: pgm.func('now()') },
    updated_at: { type: 'timestamp', default: pgm.func('now()') },
    deleted_at: { type: 'timestamp' },
    status: { type: 'text', default: 'draft' },
    is_record_changed: { type: 'boolean', default: false },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('kitchen_addresses');
};
