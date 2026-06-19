/**
 * Seed chat.resolve permission and grant to default admin/kitchen/customer roles.
 * Complements 1779850000024 (RESOLVED status + audit columns).
 */

const CHAT_RESOLVE_KEY = "chat.resolve";
const CHAT_RESOLVE_DESCRIPTION = "Allow resolving a chat";

function seedChatResolvePermission(pgm, tableName) {
  pgm.sql(`
    INSERT INTO ${tableName} (key, label_key, name, description, created_at, updated_at)
    VALUES (
      '${CHAT_RESOLVE_KEY}',
      'perm.${CHAT_RESOLVE_KEY}',
      '${CHAT_RESOLVE_KEY}',
      '${CHAT_RESOLVE_DESCRIPTION}',
      NOW(),
      NOW()
    )
    ON CONFLICT (key) DO UPDATE SET
      label_key = EXCLUDED.label_key,
      name = EXCLUDED.name,
      description = EXCLUDED.description,
      updated_at = NOW(),
      deleted_at = NULL;
  `);
}

exports.up = (pgm) => {
  for (const tableName of [
    "admin_permissions",
    "kitchen_permissions",
    "customer_permissions",
  ]) {
    seedChatResolvePermission(pgm, tableName);
  }

  pgm.sql(`
    INSERT INTO admin_role_permissions (role_id, permission_id)
    SELECT r.id, p.id
    FROM admin_roles r
    CROSS JOIN admin_permissions p
    WHERE r.name IN ('super_admin', 'superadmin', 'operations_manager', 'support_agent')
      AND p.key = '${CHAT_RESOLVE_KEY}'
    ON CONFLICT (role_id, permission_id) DO NOTHING;
  `);

  pgm.sql(`
    INSERT INTO kitchen_role_permissions (role_id, permission_id)
    SELECT r.id, p.id
    FROM kitchen_roles r
    CROSS JOIN kitchen_permissions p
    WHERE r.name = 'owner' AND r.status = 'ACTIVE'
      AND p.key = '${CHAT_RESOLVE_KEY}'
    ON CONFLICT (role_id, permission_id) DO NOTHING;
  `);

  pgm.sql(`
    INSERT INTO customer_role_permissions (role_id, permission_id)
    SELECT r.id, p.id
    FROM customer_roles r
    CROSS JOIN customer_permissions p
    WHERE r.name = 'Customer' AND r.status = 'ACTIVE'
      AND p.key = '${CHAT_RESOLVE_KEY}'
    ON CONFLICT (role_id, permission_id) DO NOTHING;
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    DELETE FROM admin_role_permissions arp
    USING admin_permissions p
    WHERE arp.permission_id = p.id AND p.key = '${CHAT_RESOLVE_KEY}';
  `);

  pgm.sql(`
    DELETE FROM kitchen_role_permissions krp
    USING kitchen_permissions p
    WHERE krp.permission_id = p.id AND p.key = '${CHAT_RESOLVE_KEY}';
  `);

  pgm.sql(`
    DELETE FROM customer_role_permissions crp
    USING customer_permissions p
    WHERE crp.permission_id = p.id AND p.key = '${CHAT_RESOLVE_KEY}';
  `);

  for (const tableName of [
    "admin_permissions",
    "kitchen_permissions",
    "customer_permissions",
  ]) {
    pgm.sql(`
      DELETE FROM ${tableName} WHERE key = '${CHAT_RESOLVE_KEY}';
    `);
  }
};
