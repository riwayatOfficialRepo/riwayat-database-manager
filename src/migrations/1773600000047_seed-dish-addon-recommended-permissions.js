/**
 * Migration: Seed add-on and recommended dish admin permissions
 */

exports.up = (pgm) => {
  pgm.sql(`
    INSERT INTO admin_permissions (key) VALUES
      ('admin.dish.addOn.create'),
      ('admin.dish.addOn.edit'),
      ('admin.dish.addOn.list.view'),
      ('admin.dish.recommended.create'),
      ('admin.dish.recommended.edit'),
      ('admin.dish.recommended.list.view'),
      ('admin.dish.recommended.detail.view')
    ON CONFLICT (key) DO NOTHING;
  `);

  pgm.sql(`
    INSERT INTO admin_role_permissions (role_id, permission_id)
    SELECT r.id, p.id
    FROM admin_roles r, admin_permissions p
    WHERE r.name = 'super_admin'
      AND p.key IN (
        'admin.dish.addOn.create',
        'admin.dish.addOn.edit',
        'admin.dish.addOn.list.view',
        'admin.dish.recommended.create',
        'admin.dish.recommended.edit',
        'admin.dish.recommended.list.view',
        'admin.dish.recommended.detail.view'
      )
    ON CONFLICT (role_id, permission_id) DO NOTHING;
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    DELETE FROM admin_permissions WHERE key IN (
      'admin.dish.addOn.create',
      'admin.dish.addOn.edit',
      'admin.dish.addOn.list.view',
      'admin.dish.recommended.create',
      'admin.dish.recommended.edit',
      'admin.dish.recommended.list.view',
      'admin.dish.recommended.detail.view'
    );
  `);
};
