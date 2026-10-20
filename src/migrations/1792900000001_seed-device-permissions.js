/**
 * Seed the device registry permissions and grant them to the default roles
 *
 * App users manage their own devices (register on login/refresh, sign out, list):
 *   customer.device.manage -> customer role 'Customer'; kitchen.device.manage -> kitchen roles 'owner', 'chef';
 *   rider.device.manage -> rider role 'Rider'.
 * Kitchen owners also see and sign out the devices of every user of their kitchen: kitchen.device.manage_all -> 'owner'.
 * Admins: admin.device.view and admin.device.revoke -> admin role 'superadmin'.
 * Idempotent (ON CONFLICT); a role that does not exist is skipped.
 */

const SEEDS = [
  { permissions: 'customer_permissions', rolePermissions: 'customer_role_permissions', roles: 'customer_roles',
    roleFilter: `r.name = 'Customer' AND r.status = 'ACTIVE'`,
    keys: [['customer.device.manage', 'Manage own devices']] },
  { permissions: 'kitchen_permissions', rolePermissions: 'kitchen_role_permissions', roles: 'kitchen_roles',
    roleFilter: `r.name IN ('owner', 'chef')`,
    keys: [['kitchen.device.manage', 'Manage own devices']] },
  { permissions: 'kitchen_permissions', rolePermissions: 'kitchen_role_permissions', roles: 'kitchen_roles',
    roleFilter: `r.name = 'owner'`,
    keys: [['kitchen.device.manage_all', 'Manage the devices of all kitchen users']] },
  { permissions: 'rider_permissions', rolePermissions: 'rider_role_permissions', roles: 'rider_roles',
    roleFilter: `r.name = 'Rider' AND r.status = 'ACTIVE'`,
    keys: [['rider.device.manage', 'Manage own devices']] },
  { permissions: 'admin_permissions', rolePermissions: 'admin_role_permissions', roles: 'admin_roles',
    roleFilter: `r.name = 'superadmin'`,
    keys: [['admin.device.view', 'View user devices'], ['admin.device.revoke', 'Revoke user devices']] },
];

const keyList = (keys) => keys.map(([key]) => `'${key}'`).join(', ');

exports.up = (pgm) => {
  for (const s of SEEDS) {
    pgm.sql(`
      INSERT INTO ${s.permissions} (key, label_key, name) VALUES
        ${s.keys.map(([key, name]) => `('${key}', 'perm.${key}', '${name}')`).join(',\n        ')}
      ON CONFLICT (key) DO UPDATE SET label_key = EXCLUDED.label_key, name = EXCLUDED.name;
    `);
    pgm.sql(`
      INSERT INTO ${s.rolePermissions} (role_id, permission_id)
      SELECT r.id, p.id FROM ${s.roles} r
      INNER JOIN ${s.permissions} p ON p.key IN (${keyList(s.keys)})
      WHERE ${s.roleFilter}
      ON CONFLICT (role_id, permission_id) DO NOTHING;
    `);
  }
};

exports.down = (pgm) => {
  for (const s of SEEDS) {
    pgm.sql(`
      DELETE FROM ${s.rolePermissions} rp USING ${s.permissions} p
      WHERE rp.permission_id = p.id AND p.key IN (${keyList(s.keys)});
    `);
    pgm.sql(`DELETE FROM ${s.permissions} WHERE key IN (${keyList(s.keys)});`);
  }
};
