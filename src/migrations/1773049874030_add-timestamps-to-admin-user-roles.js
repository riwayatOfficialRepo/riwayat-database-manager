exports.up = (pgm) => {
  pgm.addColumns('admin_user_roles', {
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('now()'),
    },
    updated_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('now()'),
    },
    deleted_at: {
      type: 'timestamp',
      notNull: false,
    },
  });

  // Create index on deleted_at for soft delete queries
  pgm.createIndex('admin_user_roles', 'deleted_at', {
    name: 'idx_admin_user_roles_deleted_at',
    ifNotExists: true,
  });
};

exports.down = (pgm) => {
  pgm.dropIndex('admin_user_roles', 'deleted_at', {
    name: 'idx_admin_user_roles_deleted_at',
    ifExists: true,
  });
  pgm.dropColumns('admin_user_roles', ['created_at', 'updated_at', 'deleted_at']);
};
