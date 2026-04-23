/**
 * Migration: Seed admin navigation/module view permissions
 */

exports.up = (pgm) => {
  pgm.sql(`
    INSERT INTO admin_permissions (key) VALUES
      ('admin.request.view'),
      ('admin.dish.view'),
      ('admin.permission.view'),
      ('admin.reports.view'),
      ('admin.engagement.view'),
      ('admin.order.view'),
      ('admin.setting.view'),
      ('admin.discount.view'),
      ('admin.customer.view'),
      ('admin.feedback.view'),
      ('admin.partner.view'),
      ('admin.dashboard.view'),
      ('admin.kitchen.view'),
      ('admin.users.view')
    ON CONFLICT (key) DO NOTHING;
  `);

  pgm.sql(`
    INSERT INTO admin_role_permissions (role_id, permission_id)
    SELECT r.id, p.id
    FROM admin_roles r, admin_permissions p
    WHERE r.name = 'super_admin'
      AND p.key IN (
        'admin.request.view',
        'admin.dish.view',
        'admin.permission.view',
        'admin.reports.view',
        'admin.engagement.view',
        'admin.order.view',
        'admin.setting.view',
        'admin.discount.view',
        'admin.customer.view',
        'admin.feedback.view',
        'admin.partner.view',
        'admin.dashboard.view',
        'admin.kitchen.view',
        'admin.users.view'
      )
    ON CONFLICT (role_id, permission_id) DO NOTHING;
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    DELETE FROM admin_permissions WHERE key IN (
      'admin.request.view',
      'admin.dish.view',
      'admin.permission.view',
      'admin.reports.view',
      'admin.engagement.view',
      'admin.order.view',
      'admin.setting.view',
      'admin.discount.view',
      'admin.customer.view',
      'admin.feedback.view',
      'admin.partner.view',
      'admin.dashboard.view',
      'admin.kitchen.view',
      'admin.users.view'
    );
  `);
};
