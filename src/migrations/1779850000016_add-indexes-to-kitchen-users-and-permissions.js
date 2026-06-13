exports.up = (pgm) => {
  // speeds up permissions query: WHERE kitchen_users.kitchen_id = $1
  pgm.createIndex('kitchen_users', ['kitchen_id'], {
    name: 'idx_kitchen_users_kitchen_id',
    ifNotExists: true,
  });

  // speeds up soft-delete filtering on kitchen_users
  pgm.createIndex('kitchen_users', ['deleted_at'], {
    name: 'idx_kitchen_users_deleted_at',
    ifNotExists: true,
  });

  // speeds up soft-delete filtering on kitchen_permissions
  pgm.createIndex('kitchen_permissions', ['deleted_at'], {
    name: 'idx_kitchen_permissions_deleted_at',
    ifNotExists: true,
  });

  // speeds up dishes soft-delete filter when not going through PK
  pgm.createIndex('dishes', ['deleted_at'], {
    name: 'idx_dishes_deleted_at',
    ifNotExists: true,
  });
};

exports.down = (pgm) => {
  pgm.dropIndex('dishes',              [], { name: 'idx_dishes_deleted_at',                  ifExists: true });
  pgm.dropIndex('kitchen_permissions', [], { name: 'idx_kitchen_permissions_deleted_at',      ifExists: true });
  pgm.dropIndex('kitchen_users',       [], { name: 'idx_kitchen_users_deleted_at',            ifExists: true });
  pgm.dropIndex('kitchen_users',       [], { name: 'idx_kitchen_users_kitchen_id',            ifExists: true });
};
