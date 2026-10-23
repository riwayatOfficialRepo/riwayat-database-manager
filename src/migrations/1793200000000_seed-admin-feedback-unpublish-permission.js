/**
 * Seed the admin feedback unpublish permission and grant it to the admin role 'superadmin'
 *
 * The other admin feedback keys (and the superadmin role) come from
 * 1779900000001_seed-all-admin-permissions-superadmin-role.js; unpublishing had none.
 * label_key/name follow that file's convention: 'perm.<key>' and '<Entity> <Action>'.
 * Idempotent (ON CONFLICT); a role that does not exist is skipped.
 */

const KEYS = [['admin.feedback.unpublish', 'Feedback Unpublish']];

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
