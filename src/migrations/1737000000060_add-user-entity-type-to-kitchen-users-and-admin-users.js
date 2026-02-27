/**
 * Migration: Add user_entity_type column to kitchen_users and admin_users
 * Depends on user_entity_type enum from migration 1737000000059
 * - kitchen_users: default 'PARTNER'
 * - admin_users: default 'TEAM'
 */

exports.up = (pgm) => {
  pgm.addColumn('kitchen_users', {
    user_entity_type: {
      type: 'user_entity_type',
      notNull: true,
      default: 'PARTNER',
    },
  });

  pgm.addColumn('admin_users', {
    user_entity_type: {
      type: 'user_entity_type',
      notNull: true,
      default: 'TEAM',
    },
  });

  pgm.createIndex('kitchen_users', 'user_entity_type', {
    name: 'idx_kitchen_users_user_entity_type',
    ifNotExists: true,
  });

  pgm.createIndex('admin_users', 'user_entity_type', {
    name: 'idx_admin_users_user_entity_type',
    ifNotExists: true,
  });
};

exports.down = (pgm) => {
  pgm.dropIndex('kitchen_users', 'user_entity_type', {
    name: 'idx_kitchen_users_user_entity_type',
    ifExists: true,
  });

  pgm.dropIndex('admin_users', 'user_entity_type', {
    name: 'idx_admin_users_user_entity_type',
    ifExists: true,
  });

  pgm.dropColumn('kitchen_users', 'user_entity_type');
  pgm.dropColumn('admin_users', 'user_entity_type');
};
