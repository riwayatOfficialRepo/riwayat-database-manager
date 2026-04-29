/**
 * Migration: Seed admin permissions, superadmin role, and map all permissions to it
 */

exports.up = (pgm) => {
  // ── SEED: admin_permissions ──────────────────────────────────
  pgm.sql(`
    INSERT INTO admin_permissions (key) VALUES
      -- USER
      ('admin.user.create'),
      ('admin.user.list.view'),
      ('admin.user.delete'),
      ('admin.user.edit'),
      ('admin.user.activate'),
      ('admin.user.deactivate'),
      -- ROLE
      ('admin.role.create'),
      ('admin.role.edit'),
      ('admin.role.delete'),
      ('admin.role.list.view'),
      -- PERMISSION
      ('admin.permission.create'),
      ('admin.permission.edit'),
      ('admin.permission.delete'),
      ('admin.permission.list.view'),
      -- KITCHEN
      ('admin.kitchen.create'),
      ('admin.kitchen.edit'),
      ('admin.kitchen.delete'),
      ('admin.kitchen.list.view'),
      ('admin.kitchen.detail.view'),
      ('admin.kitchen.address.add'),
      ('admin.kitchen.address.edit'),
      ('admin.kitchen.address.list.view'),
      ('admin.kitchen.partner.list.view'),
      ('admin.kitchen.availability.add'),
      ('admin.kitchen.availability.view'),
      ('admin.kitchen.chef.invite'),
      ('admin.kitchen.submit'),
      ('admin.kitchen.request.list.view'),
      ('admin.kitchen.media.upload'),
      ('admin.kitchen.media.delete'),
      ('admin.kitchen.media.list.view'),
      ('admin.kitchen.dish.list.view'),
      -- DISH
      ('admin.dish.create'),
      ('admin.dish.edit'),
      ('admin.dish.list.view'),
      ('admin.dish.detail.view'),
      ('admin.dish.variant.create'),
      ('admin.dish.variant.list.view'),
      ('admin.dish.variant.detail.view'),
      ('admin.dish.variant.edit'),
      ('admin.dish.variant.item.create'),
      ('admin.dish.variant.item.edit'),
      ('admin.dish.variant.item.detail.view'),
      ('admin.dish.variant.item.list.view'),
      ('admin.dish.variant.item.delete'),
      ('admin.dish.availability.add'),
      ('admin.dish.availability.view'),
      ('admin.dish.specialEvent.create'),
      ('admin.dish.specialEvent.edit'),
      ('admin.dish.specialEvent.list.view'),
      ('admin.dish.specialEvent.detail.view'),
      ('admin.dish.media.upload'),
      ('admin.dish.media.delete'),
      ('admin.dish.media.list.view'),
      ('admin.dish.submit'),
      -- FEEDBACK
      ('admin.feedback.list.view'),
      ('admin.feedback.detail.view'),
      ('admin.feedback.reject'),
      ('admin.feedback.send.to.kitchen'),
      ('admin.feedback.edit'),
      ('admin.feedback.media.delete'),
      -- PARTNER
      ('admin.partner.create'),
      ('admin.partner.edit'),
      ('admin.partner.delete'),
      ('admin.partner.list.view'),
      ('admin.partner.detail.view'),
      -- REQUEST
      ('admin.request.list.view'),
      ('admin.request.detail.view'),
      ('admin.request.approve'),
      -- PROMOTION
      ('admin.promotion.create'),
      ('admin.promotion.edit'),
      ('admin.promotion.list.view'),
      ('admin.promotion.detail.view'),
      ('admin.promotion.submit'),
      ('admin.promotion.eligibility.create'),
      ('admin.promotion.eligibility.edit'),
      ('admin.promotion.eligibility.view'),
      ('admin.promotion.audience.rule.create'),
      ('admin.promotion.audience.rule.edit'),
      ('admin.promotion.audience.rule.view'),
      ('admin.promotion.code.create'),
      ('admin.promotion.code.edit'),
      ('admin.promotion.code.view'),
      ('admin.promotion.target.create'),
      ('admin.promotion.target.edit'),
      ('admin.promotion.target.view'),
      ('admin.promotion.target.delete'),
      ('admin.promotion.target.accept'),
      ('admin.promotion.target.status.update')
    ON CONFLICT (key) DO NOTHING;
  `);

  // ── SEED: superadmin role ───────────────────────────────────
  pgm.sql(`
    INSERT INTO admin_roles (name, description, is_active)
    VALUES ('superadmin', 'Full access to all admin features', true)
    ON CONFLICT (name) DO NOTHING;
  `);

  // ── MAP: all permissions -> superadmin role ─────────────────
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
    DELETE FROM admin_role_permissions
    WHERE role_id = (SELECT id FROM admin_roles WHERE name = 'superadmin');
  `);
  pgm.sql(`DELETE FROM admin_roles WHERE name = 'superadmin'`);
  pgm.sql(`
    DELETE FROM admin_permissions WHERE key LIKE 'admin.%';
  `);
};
