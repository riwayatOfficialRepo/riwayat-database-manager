exports.up = (pgm) => {
  // speeds up WHERE p.deleted_at IS NULL filter on admin_permissions
  pgm.createIndex('admin_permissions', ['deleted_at'], {
    name: 'idx_admin_permissions_deleted_at',
    ifNotExists: true,
  });

  // speeds up reverse join: admin_permissions.id -> admin_role_permissions.permission_id
  // the existing unique index is (role_id, permission_id) — doesn't cover permission_id-first lookups
  pgm.createIndex('admin_role_permissions', ['permission_id'], {
    name: 'idx_admin_role_permissions_permission_id',
    ifNotExists: true,
  });

  // speeds up admin_user_roles lookups by role_id alone (join from admin_role_permissions)
  pgm.createIndex('admin_user_roles', ['role_id'], {
    name: 'idx_admin_user_roles_role_id',
    ifNotExists: true,
  });
};

exports.down = (pgm) => {
  pgm.dropIndex('admin_user_roles',       [], { name: 'idx_admin_user_roles_role_id',              ifExists: true });
  pgm.dropIndex('admin_role_permissions', [], { name: 'idx_admin_role_permissions_permission_id',   ifExists: true });
  pgm.dropIndex('admin_permissions',      [], { name: 'idx_admin_permissions_deleted_at',           ifExists: true });
};
