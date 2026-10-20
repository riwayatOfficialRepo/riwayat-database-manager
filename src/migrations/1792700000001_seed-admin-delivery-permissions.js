/**
 * Seed the admin Delivery Management read permissions and grant them to admin role 'superadmin'
 *
 * Delivery companies, riders, deliveries and rides in the admin portal (read-only).
 * Finance data (bank accounts, earnings, COD wallet, payouts) has its own permission.
 * admin.rider.list.view already exists (1775900000000). Idempotent (ON CONFLICT).
 */

const KEYS = [
  ['admin.delivery_company.list.view', 'View delivery companies'],
  ['admin.delivery_company.detail.view', 'View delivery company details'],
  ['admin.rider.detail.view', 'View rider details'],
  ['admin.delivery.list.view', 'View deliveries'],
  ['admin.delivery.detail.view', 'View delivery details'],
  ['admin.ride.list.view', 'View rides'],
  ['admin.ride.detail.view', 'View ride details'],
  ['admin.delivery.finance.view', 'View delivery finance'],
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
