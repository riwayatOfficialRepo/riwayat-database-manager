exports.up = (pgm) => {
  pgm.createTable('kitchen_user_roles', {
    id: { type: 'serial', primaryKey: true },
    kitchen_user_id: {
      type: 'uuid',
      notNull: true,
      references: 'kitchen_users(id)',
      onDelete: 'CASCADE',
    },
    role_id: {
      type: 'integer',
      notNull: true,
      references: 'kitchen_roles(id)',
      onDelete: 'CASCADE',
    },
    assigned_at: { type: 'timestamp', default: pgm.func('now()') },
    status: { type: 'varchar(20)', notNull: true, default: 'ACTIVE' },
  });

  pgm.addConstraint('kitchen_user_roles', 'kitchen_user_roles_user_role_key', {
    unique: ['kitchen_user_id', 'role_id'],
  });
};

exports.down = (pgm) => {
  pgm.dropTable('kitchen_user_roles');
};
