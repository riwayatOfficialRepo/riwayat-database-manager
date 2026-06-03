exports.up = (pgm) => {
  pgm.sql(`
    INSERT INTO admin_permissions (key) VALUES
      ('case.list.view'),
      ('case.detail.view')
    ON CONFLICT (key) DO NOTHING;
  `);

  pgm.sql(`
    INSERT INTO admin_role_permissions (role_id, permission_id)
    SELECT r.id, p.id
    FROM admin_roles r, admin_permissions p
    WHERE r.name = 'superadmin'
      AND p.key IN ('case.list.view', 'case.detail.view')
    ON CONFLICT (role_id, permission_id) DO NOTHING;
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    DELETE FROM admin_permissions WHERE key IN ('case.list.view', 'case.detail.view');
  `);
};
