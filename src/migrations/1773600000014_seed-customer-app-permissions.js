/**
 * Seed customer app permission keys (addresses, profile, preferences, kitchen favorites)
 * and grant them to the default "Customer" role. Backfill customer_user_roles for any
 * customer missing that role.
 */
exports.up = (pgm) => {
  // label_key: same convention as kitchen_permissions in seed.js — `perm.` + permission key (i18n lookup)
  pgm.sql(`
    INSERT INTO customer_permissions (key, label_key, name) VALUES
      ('customer.address.list', 'perm.customer.address.list', 'List delivery addresses'),
      ('customer.address.default.get', 'perm.customer.address.default.get', 'Get default delivery address'),
      ('customer.address.create', 'perm.customer.address.create', 'Create delivery address'),
      ('customer.address.update', 'perm.customer.address.update', 'Update delivery address'),
      ('customer.address.default.set', 'perm.customer.address.default.set', 'Set default delivery address'),
      ('customer.address.delete', 'perm.customer.address.delete', 'Delete delivery address'),
      ('customer.preference.list', 'perm.customer.preference.list', 'List preferences'),
      ('customer.preference.key.get', 'perm.customer.preference.key.get', 'Get preferences by key'),
      ('customer.preference.create', 'perm.customer.preference.create', 'Create preference'),
      ('customer.preference.update', 'perm.customer.preference.update', 'Update preference'),
      ('customer.preference.delete', 'perm.customer.preference.delete', 'Delete preference'),
      ('customer.profile.get', 'perm.customer.profile.get', 'Get own profile'),
      ('customer.profile.create', 'perm.customer.profile.create', 'Initiate profile create'),
      ('customer.profile.update', 'perm.customer.profile.update', 'Initiate profile update'),
      ('customer.profile.delete', 'perm.customer.profile.delete', 'Initiate profile delete'),
      ('customer.kitchen.favorite.add', 'perm.customer.kitchen.favorite.add', 'Mark kitchen favorite'),
      ('customer.kitchen.favorite.remove', 'perm.customer.kitchen.favorite.remove', 'Unmark kitchen favorite')
    ON CONFLICT (key) DO UPDATE SET
      label_key = EXCLUDED.label_key,
      name = EXCLUDED.name;
  `);

  pgm.sql(`
    INSERT INTO customer_role_permissions (role_id, permission_id)
    SELECT r.id, p.id
    FROM customer_roles r
    INNER JOIN customer_permissions p ON p.key LIKE 'customer.%'
    WHERE r.name = 'Customer' AND r.status = 'ACTIVE'
    ON CONFLICT (role_id, permission_id) DO NOTHING;
  `);

  pgm.sql(`
    INSERT INTO customer_user_roles (customer_user_id, role_id, status)
    SELECT c.id, r.id, 'ACTIVE'
    FROM customer c
    CROSS JOIN customer_roles r
    WHERE r.name = 'Customer' AND r.status = 'ACTIVE'
      AND c.status IS DISTINCT FROM 'deleted'
      AND NOT EXISTS (
        SELECT 1 FROM customer_user_roles cur
        WHERE cur.customer_user_id = c.id AND cur.role_id = r.id
      );
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    DELETE FROM customer_role_permissions crp
    USING customer_permissions p, customer_roles r
    WHERE crp.permission_id = p.id
      AND crp.role_id = r.id
      AND r.name = 'Customer'
      AND p.key LIKE 'customer.%';
  `);

  pgm.sql(`
    DELETE FROM customer_permissions WHERE key LIKE 'customer.%';
  `);
};
