/**
 * Seed the admin Order Management read permissions and grant them to admin role 'superadmin'
 *
 * Orders and carts in the admin portal (read-only).
 * admin.order.view already exists and is not changed. Idempotent (ON CONFLICT).
 */

const KEYS = [
  ['admin.order.list.view', 'View orders'],
  ['admin.order.detail.view', 'View order details'],
  ['admin.cart.list.view', 'View carts'],
  ['admin.cart.detail.view', 'View cart details'],
];

const keyList = KEYS.map(([key]) => `'${key}'`).join(', ');

exports.up = (pgm) => {
  pgm.sql(`
    INSERT INTO admin_permissions (key, label_key, name) VALUES
      ${KEYS.map(([key, name]) => `('${key}', 'perm.${key}', '${name}')`).join(',\n      ')}
    ON CONFLICT (key) DO UPDATE SET label_key = EXCLUDED.label_key, name = EXCLUDED.name;
  `);
  pgm.sql(`
    INSERT INTO admin_role_permissions (role_id, permission_id)
    SELECT r.id, p.id FROM admin_roles r
    INNER JOIN admin_permissions p ON p.key IN (${keyList})
    WHERE r.name = 'superadmin'
    ON CONFLICT (role_id, permission_id) DO NOTHING;
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    DELETE FROM admin_role_permissions rp USING admin_permissions p
    WHERE rp.permission_id = p.id AND p.key IN (${keyList});
  `);
  pgm.sql(`DELETE FROM admin_permissions WHERE key IN (${keyList});`);
};
