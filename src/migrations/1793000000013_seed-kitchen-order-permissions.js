/**
 * Seed the kitchen Order Management read permissions and grant them to kitchen roles 'owner' and 'chef'
 *
 * Kitchen users see the orders of their own kitchen (read-only).
 * Idempotent (ON CONFLICT); a role that does not exist is skipped.
 */

const KEYS = [
  ['kitchen.order.list.view', 'View orders'],
  ['kitchen.order.detail.view', 'View order details'],
];

const keyList = KEYS.map(([key]) => `'${key}'`).join(', ');

exports.up = (pgm) => {
  pgm.sql(`
    INSERT INTO kitchen_permissions (key, label_key, name) VALUES
      ${KEYS.map(([key, name]) => `('${key}', 'perm.${key}', '${name}')`).join(',\n      ')}
    ON CONFLICT (key) DO UPDATE SET label_key = EXCLUDED.label_key, name = EXCLUDED.name;
  `);
  pgm.sql(`
    INSERT INTO kitchen_role_permissions (role_id, permission_id)
    SELECT r.id, p.id FROM kitchen_roles r
    INNER JOIN kitchen_permissions p ON p.key IN (${keyList})
    WHERE r.name IN ('owner', 'chef')
    ON CONFLICT (role_id, permission_id) DO NOTHING;
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    DELETE FROM kitchen_role_permissions rp USING kitchen_permissions p
    WHERE rp.permission_id = p.id AND p.key IN (${keyList});
  `);
  pgm.sql(`DELETE FROM kitchen_permissions WHERE key IN (${keyList});`);
};
