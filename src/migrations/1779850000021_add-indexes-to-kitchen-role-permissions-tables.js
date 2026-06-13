exports.up = (pgm) => {
  // speeds up reverse join: kitchen_permissions.id -> kitchen_role_permissions.permission_id
  pgm.createIndex('kitchen_role_permissions', ['permission_id'], {
    name: 'idx_kitchen_role_permissions_permission_id',
    ifNotExists: true,
  });

  // speeds up join: kitchen_role_permissions.role_id -> kitchen_user_roles.role_id
  pgm.createIndex('kitchen_user_roles', ['role_id'], {
    name: 'idx_kitchen_user_roles_role_id',
    ifNotExists: true,
  });

  // speeds up lookup by kitchen_user_id alone
  pgm.createIndex('kitchen_user_roles', ['kitchen_user_id'], {
    name: 'idx_kitchen_user_roles_kitchen_user_id',
    ifNotExists: true,
  });
};

exports.down = (pgm) => {
  pgm.dropIndex('kitchen_user_roles',       [], { name: 'idx_kitchen_user_roles_kitchen_user_id',       ifExists: true });
  pgm.dropIndex('kitchen_user_roles',       [], { name: 'idx_kitchen_user_roles_role_id',               ifExists: true });
  pgm.dropIndex('kitchen_role_permissions', [], { name: 'idx_kitchen_role_permissions_permission_id',    ifExists: true });
};
