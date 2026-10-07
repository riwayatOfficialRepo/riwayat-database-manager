exports.up = (pgm) => {
  pgm.createIndex('kitchen_addresses', ['kitchen_id'], {
    name: 'idx_kitchen_addresses_kitchen_id',
    where: 'deleted_at IS NULL',
    ifNotExists: true,
  });

  pgm.createIndex('kitchen_media', ['kitchen_id'], {
    name: 'idx_kitchen_media_kitchen_id',
    where: 'deleted_at IS NULL',
    ifNotExists: true,
  });

  pgm.createIndex('kitchen_availabilities', ['kitchen_id'], {
    name: 'idx_kitchen_availabilities_kitchen_id',
    where: 'deleted_at IS NULL',
    ifNotExists: true,
  });
};

exports.down = (pgm) => {
  pgm.dropIndex('kitchen_addresses', [], { name: 'idx_kitchen_addresses_kitchen_id', ifExists: true });
  pgm.dropIndex('kitchen_media', [], { name: 'idx_kitchen_media_kitchen_id', ifExists: true });
  pgm.dropIndex('kitchen_availabilities', [], { name: 'idx_kitchen_availabilities_kitchen_id', ifExists: true });
};
