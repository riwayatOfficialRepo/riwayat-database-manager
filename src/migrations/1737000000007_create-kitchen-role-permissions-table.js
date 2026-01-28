exports.up = (pgm) => {
  pgm.createTable('kitchen_role_permissions', {
    id: { type: 'serial', primaryKey: true },
    role_id: {
      type: 'integer',
      notNull: true,
      references: 'kitchen_roles(id)',
      onDelete: 'CASCADE',
    },
    permission_id: {
      type: 'integer',
      notNull: true,
      references: 'kitchen_permissions(id)',
      onDelete: 'CASCADE',
    },
  });

  pgm.addConstraint('kitchen_role_permissions', 'kitchen_role_permissions_role_id_permission_id_key', {
    unique: ['role_id', 'permission_id'],
  });
};

exports.down = (pgm) => {
  pgm.dropTable('kitchen_role_permissions');
};
