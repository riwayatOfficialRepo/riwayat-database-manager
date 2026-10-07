exports.up = (pgm) => {
  pgm.createIndex('kitchen_addresses_staging', ['kitchen_staging_id'], {
    name: 'idx_kitchen_addresses_staging_kitchen_staging_id',
    where: 'deleted_at IS NULL',
    ifNotExists: true,
  });

  pgm.createIndex('kitchen_availability_staging', ['kitchen_staging_id'], {
    name: 'idx_kitchen_availability_staging_kitchen_staging_id',
    ifNotExists: true,
  });
};

exports.down = (pgm) => {
  pgm.dropIndex('kitchen_addresses_staging', [], { name: 'idx_kitchen_addresses_staging_kitchen_staging_id', ifExists: true });
  pgm.dropIndex('kitchen_availability_staging', [], { name: 'idx_kitchen_availability_staging_kitchen_staging_id', ifExists: true });
};
