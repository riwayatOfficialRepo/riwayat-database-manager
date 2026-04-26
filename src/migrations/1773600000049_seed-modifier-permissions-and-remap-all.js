/**
 * Migration: Seed modifier permissions and remap all permissions to super_admin
 */

exports.up = (pgm) => {
  // ── seed modifier permissions ────────────────────────────────
  pgm.sql(`
    INSERT INTO admin_permissions (key) VALUES
      ('admin.dish.modifier.create'),
      ('admin.dish.modifier.edit'),
      ('admin.dish.modifier.delete'),
      ('admin.dish.modifier.list.view'),
      ('admin.dish.modifier.detail.view')
    ON CONFLICT (key) DO NOTHING;
  `);

  // ── map ALL permissions to super_admin (covers any gaps) ─────
  pgm.sql(`
    INSERT INTO admin_role_permissions (role_id, permission_id)
    SELECT r.id, p.id
    FROM admin_roles r, admin_permissions p
    WHERE r.name = 'superadmin'
    ON CONFLICT (role_id, permission_id) DO NOTHING;
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    DELETE FROM admin_permissions WHERE key IN (
      'admin.dish.modifier.create',
      'admin.dish.modifier.edit',
      'admin.dish.modifier.delete',
      'admin.dish.modifier.list.view',
      'admin.dish.modifier.detail.view'
    );
  `);
};
