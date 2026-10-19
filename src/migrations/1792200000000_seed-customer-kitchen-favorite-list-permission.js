/**
 * Seed the customer.kitchen.favorite.list permission (list a customer's
 * favorite kitchens) and grant it to the default "Customer" role, matching
 * the pattern in 1773600000014_seed-customer-app-permissions.js.
 */
exports.up = (pgm) => {
  pgm.sql(`
    INSERT INTO customer_permissions (key, label_key, name) VALUES
      ('customer.kitchen.favorite.list', 'perm.customer.kitchen.favorite.list', 'List favorite kitchens')
    ON CONFLICT (key) DO UPDATE SET
      label_key = EXCLUDED.label_key,
      name = EXCLUDED.name;
  `);

  pgm.sql(`
    INSERT INTO customer_role_permissions (role_id, permission_id)
    SELECT r.id, p.id
    FROM customer_roles r
    INNER JOIN customer_permissions p ON p.key = 'customer.kitchen.favorite.list'
    WHERE r.name = 'Customer' AND r.status = 'ACTIVE'
    ON CONFLICT (role_id, permission_id) DO NOTHING;
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    DELETE FROM customer_role_permissions crp
    USING customer_permissions p, customer_roles r
    WHERE crp.permission_id = p.id
      AND crp.role_id = r.id
      AND r.name = 'Customer'
      AND p.key = 'customer.kitchen.favorite.list';
  `);

  pgm.sql(`
    DELETE FROM customer_permissions WHERE key = 'customer.kitchen.favorite.list';
  `);
};
