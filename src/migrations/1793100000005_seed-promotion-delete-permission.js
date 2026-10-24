/**
 * Seed the promotion delete permission and grant it to the default admin role
 *
 * Admins soft-delete DRAFT promotions: admin.promotion.delete -> admin role 'superadmin'.
 * Idempotent (ON CONFLICT); a role that does not exist is skipped.
 */

const SEEDS = [
  { permissions: 'admin_permissions', rolePermissions: 'admin_role_permissions', roles: 'admin_roles',
    roleFilter: `r.name = 'superadmin'`,
    keys: [['admin.promotion.delete', 'Promotion Delete']] },
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
