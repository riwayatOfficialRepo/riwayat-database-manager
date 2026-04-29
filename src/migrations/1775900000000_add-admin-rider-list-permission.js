/**
 * Add admin permission for listing riders and grant it to admin role_id=1.
 */
exports.up = (pgm) => {
  pgm.sql(`
    INSERT INTO admin_permissions (key, label_key, name, description)
    VALUES (
      'admin.rider.list.view',
      'perm.admin.rider.list.view',
      'Get All Riders (Admin)',
      'Allow admin to list all riders.'
    )
    ON CONFLICT (key) DO UPDATE SET
      label_key = EXCLUDED.label_key,
      name = EXCLUDED.name,
      description = EXCLUDED.description,
      updated_at = NOW();
  `);

  pgm.sql(`
    INSERT INTO admin_role_permissions (role_id, permission_id)
    SELECT 1, p.id
    FROM admin_permissions p
    WHERE p.key = 'admin.rider.list.view'
    ON CONFLICT (role_id, permission_id) DO NOTHING;
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    DELETE FROM admin_role_permissions arp
    USING admin_permissions p
    WHERE arp.permission_id = p.id
      AND arp.role_id = 1
      AND p.key = 'admin.rider.list.view';
  `);

  pgm.sql(`
    DELETE FROM admin_permissions
    WHERE key = 'admin.rider.list.view';
  `);
};
