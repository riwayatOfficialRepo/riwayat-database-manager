/**
 * Seed all admin permission keys (from src/config/permissions.js's ADMIN tree)
 * into admin_permissions, and grant every one of them to the "superadmin" role.
 *
 * Context: hasAdminPermissions() checks were previously commented out across
 * the whole admin surface and have just been enabled. Without this seed, every
 * admin action would throw USER.NOT_AUTHORIZED since no permission rows or
 * role grants existed yet.
 *
 * Scope: only touches the "superadmin" role. Does not create or modify any
 * other role, and does not assign superadmin to any admin user automatically.
 */
exports.up = (pgm) => {
  pgm.sql(`
    INSERT INTO admin_permissions (key, label_key, name) VALUES
      ('admin.user.create', 'perm.admin.user.create', 'User Create'),
      ('admin.user.list.view', 'perm.admin.user.list.view', 'User List View'),
      ('admin.user.delete', 'perm.admin.user.delete', 'User Delete'),
      ('admin.user.edit', 'perm.admin.user.edit', 'User Edit'),
      ('admin.user.activate', 'perm.admin.user.activate', 'User Activate'),
      ('admin.user.deactivate', 'perm.admin.user.deactivate', 'User Deactivate'),
      ('admin.user.reset.pin', 'perm.admin.user.reset.pin', 'User Reset Pin'),
      ('admin.role.create', 'perm.admin.role.create', 'Role Create'),
      ('admin.role.edit', 'perm.admin.role.edit', 'Role Edit'),
      ('admin.role.delete', 'perm.admin.role.delete', 'Role Delete'),
      ('admin.role.list.view', 'perm.admin.role.list.view', 'Role List View'),
      ('admin.permission.create', 'perm.admin.permission.create', 'Permission Create'),
      ('admin.permission.edit', 'perm.admin.permission.edit', 'Permission Edit'),
      ('admin.permission.delete', 'perm.admin.permission.delete', 'Permission Delete'),
      ('admin.permission.list.view', 'perm.admin.permission.list.view', 'Permission List View'),
      ('admin.kitchen.create', 'perm.admin.kitchen.create', 'Kitchen Create'),
      ('admin.kitchen.edit', 'perm.admin.kitchen.edit', 'Kitchen Edit'),
      ('admin.kitchen.delete', 'perm.admin.kitchen.delete', 'Kitchen Delete'),
      ('admin.kitchen.list.view', 'perm.admin.kitchen.list.view', 'Kitchen List View'),
      ('admin.kitchen.detail.view', 'perm.admin.kitchen.detail.view', 'Kitchen Detail View'),
      ('admin.kitchen.submit', 'perm.admin.kitchen.submit', 'Kitchen Submit'),
      ('admin.kitchen.request.list.view', 'perm.admin.kitchen.request.list.view', 'Kitchen Request List View'),
      ('admin.kitchen.dish.list.view', 'perm.admin.kitchen.dish.list.view', 'Kitchen Dish List View'),
      ('admin.kitchen.address.add', 'perm.admin.kitchen.address.add', 'Kitchen Add Address'),
      ('admin.kitchen.address.edit', 'perm.admin.kitchen.address.edit', 'Kitchen Edit Address'),
      ('admin.kitchen.address.list.view', 'perm.admin.kitchen.address.list.view', 'Kitchen Address View'),
      ('admin.kitchen.availability.add', 'perm.admin.kitchen.availability.add', 'Kitchen Availability'),
      ('admin.kitchen.availability.view', 'perm.admin.kitchen.availability.view', 'Kitchen Availability View'),
      ('admin.kitchen.media.upload', 'perm.admin.kitchen.media.upload', 'Kitchen Upload Media'),
      ('admin.kitchen.media.edit', 'perm.admin.kitchen.media.edit', 'Kitchen Edit Media'),
      ('admin.kitchen.media.publish', 'perm.admin.kitchen.media.publish', 'Kitchen Publish Media'),
      ('admin.kitchen.media.delete', 'perm.admin.kitchen.media.delete', 'Kitchen Delete Media'),
      ('admin.kitchen.media.list.view', 'perm.admin.kitchen.media.list.view', 'Kitchen View Media'),
      ('admin.kitchen.chefStory.create', 'perm.admin.kitchen.chefStory.create', 'Kitchen Chef Story Create'),
      ('admin.kitchen.chefStory.edit', 'perm.admin.kitchen.chefStory.edit', 'Kitchen Chef Story Edit'),
      ('admin.kitchen.chefStory.list.view', 'perm.admin.kitchen.chefStory.list.view', 'Kitchen Chef Story View'),
      ('admin.kitchen.userDoc.create', 'perm.admin.kitchen.userDoc.create', 'Kitchen User Doc Create'),
      ('admin.kitchen.userDoc.list.view', 'perm.admin.kitchen.userDoc.list.view', 'Kitchen User Doc View'),
      ('admin.kitchen.chef.invite', 'perm.admin.kitchen.chef.invite', 'Kitchen Invite Chef'),
      ('admin.kitchen.user.invite', 'perm.admin.kitchen.user.invite', 'Kitchen Invite User'),
      ('admin.kitchen.invitation.resend', 'perm.admin.kitchen.invitation.resend', 'Kitchen Resend Invitation'),
      ('admin.kitchen.invitation.revoke', 'perm.admin.kitchen.invitation.revoke', 'Kitchen Revoke Invitation'),
      ('admin.kitchen.invitation.accept', 'perm.admin.kitchen.invitation.accept', 'Kitchen Accept Invitation'),
      ('admin.kitchen.invitation.reject', 'perm.admin.kitchen.invitation.reject', 'Kitchen Reject Invitation'),
      ('admin.kitchen.invitation.list.view', 'perm.admin.kitchen.invitation.list.view', 'Kitchen View Invitations'),
      ('admin.kitchen.user.unblock', 'perm.admin.kitchen.user.unblock', 'Kitchen Unblock User'),
      ('admin.kitchen.partner.list.view', 'perm.admin.kitchen.partner.list.view', 'Kitchen Partner List'),
      ('admin.kitchen.onboarding.submit', 'perm.admin.kitchen.onboarding.submit', 'Kitchen Submit Onboarding'),
      ('admin.kitchen.menu.create', 'perm.admin.kitchen.menu.create', 'Kitchen Menu Create'),
      ('admin.kitchen.menu.edit', 'perm.admin.kitchen.menu.edit', 'Kitchen Menu Edit'),
      ('admin.kitchen.menu.delete', 'perm.admin.kitchen.menu.delete', 'Kitchen Menu Delete'),
      ('admin.kitchen.menu.list.view', 'perm.admin.kitchen.menu.list.view', 'Kitchen Menu List View'),
      ('admin.kitchen.menu.detail.view', 'perm.admin.kitchen.menu.detail.view', 'Kitchen Menu Detail View'),
      ('admin.kitchen.menu.updateDishes', 'perm.admin.kitchen.menu.updateDishes', 'Kitchen Menu Update Dishes'),
      ('admin.kitchen.menu.reorder', 'perm.admin.kitchen.menu.reorder', 'Kitchen Menu Reorder'),
      ('admin.dish.create', 'perm.admin.dish.create', 'Dish Create'),
      ('admin.dish.edit', 'perm.admin.dish.edit', 'Dish Edit'),
      ('admin.dish.list.view', 'perm.admin.dish.list.view', 'Dish List View'),
      ('admin.dish.detail.view', 'perm.admin.dish.detail.view', 'Dish Detail View'),
      ('admin.dish.submit', 'perm.admin.dish.submit', 'Dish Submit'),
      ('admin.dish.media.upload', 'perm.admin.dish.media.upload', 'Dish Upload Media'),
      ('admin.dish.media.edit', 'perm.admin.dish.media.edit', 'Dish Edit Media'),
      ('admin.dish.media.publish', 'perm.admin.dish.media.publish', 'Dish Publish Media'),
      ('admin.dish.media.delete', 'perm.admin.dish.media.delete', 'Dish Delete Media'),
      ('admin.dish.media.list.view', 'perm.admin.dish.media.list.view', 'Dish View Media'),
      ('admin.dish.variant.create', 'perm.admin.dish.variant.create', 'Dish Create Variant'),
      ('admin.dish.variant.edit', 'perm.admin.dish.variant.edit', 'Dish Variant Edit'),
      ('admin.dish.variant.list.view', 'perm.admin.dish.variant.list.view', 'Dish Variant List View'),
      ('admin.dish.variant.detail.view', 'perm.admin.dish.variant.detail.view', 'Dish Variant Detail View'),
      ('admin.dish.variant.item.create', 'perm.admin.dish.variant.item.create', 'Dish Variant Item Create'),
      ('admin.dish.variant.item.edit', 'perm.admin.dish.variant.item.edit', 'Dish Variant Item Edit'),
      ('admin.dish.variant.item.list.view', 'perm.admin.dish.variant.item.list.view', 'Dish Variant Item List View'),
      ('admin.dish.variant.item.detail.view', 'perm.admin.dish.variant.item.detail.view', 'Dish Variant Item Detail View'),
      ('admin.dish.variant.item.delete', 'perm.admin.dish.variant.item.delete', 'Dish Variant Item Delete'),
      ('admin.dish.availability.add', 'perm.admin.dish.availability.add', 'Dish Create Availability'),
      ('admin.dish.availability.view', 'perm.admin.dish.availability.view', 'Dish View Availability'),
      ('admin.dish.specialEvent.create', 'perm.admin.dish.specialEvent.create', 'Dish Create Special Event'),
      ('admin.dish.specialEvent.edit', 'perm.admin.dish.specialEvent.edit', 'Dish Edit Special Event'),
      ('admin.dish.specialEvent.list.view', 'perm.admin.dish.specialEvent.list.view', 'Dish List View Special Event'),
      ('admin.dish.specialEvent.detail.view', 'perm.admin.dish.specialEvent.detail.view', 'Dish Detail View Special Event'),
      ('admin.dish.addOn.create', 'perm.admin.dish.addOn.create', 'Dish Add On Create'),
      ('admin.dish.addOn.edit', 'perm.admin.dish.addOn.edit', 'Dish Add On Edit'),
      ('admin.dish.addOn.list.view', 'perm.admin.dish.addOn.list.view', 'Dish Add On List View'),
      ('admin.dish.modifier.create', 'perm.admin.dish.modifier.create', 'Dish Modifier Create'),
      ('admin.dish.modifier.edit', 'perm.admin.dish.modifier.edit', 'Dish Modifier Edit'),
      ('admin.dish.modifier.list.view', 'perm.admin.dish.modifier.list.view', 'Dish Modifier List View'),
      ('admin.dish.modifier.detail.view', 'perm.admin.dish.modifier.detail.view', 'Dish Modifier Detail View'),
      ('admin.dish.recommended.create', 'perm.admin.dish.recommended.create', 'Dish Recommended Dish Create'),
      ('admin.dish.recommended.edit', 'perm.admin.dish.recommended.edit', 'Dish Recommended Dish Edit'),
      ('admin.dish.recommended.list.view', 'perm.admin.dish.recommended.list.view', 'Dish Recommended Dish List View'),
      ('admin.dish.recommended.detail.view', 'perm.admin.dish.recommended.detail.view', 'Dish Recommended Dish Detail View'),
      ('admin.feedback.list.view', 'perm.admin.feedback.list.view', 'Feedback List View'),
      ('admin.feedback.detail.view', 'perm.admin.feedback.detail.view', 'Feedback Detail View'),
      ('admin.feedback.reject', 'perm.admin.feedback.reject', 'Feedback Reject'),
      ('admin.feedback.send.to.kitchen', 'perm.admin.feedback.send.to.kitchen', 'Feedback Send To Kitchen'),
      ('admin.feedback.edit', 'perm.admin.feedback.edit', 'Feedback Edit'),
      ('admin.feedback.media.delete', 'perm.admin.feedback.media.delete', 'Feedback Media Delete'),
      ('admin.partner.create', 'perm.admin.partner.create', 'Partner Create'),
      ('admin.partner.edit', 'perm.admin.partner.edit', 'Partner Edit'),
      ('admin.partner.delete', 'perm.admin.partner.delete', 'Partner Delete'),
      ('admin.partner.list.view', 'perm.admin.partner.list.view', 'Partner List View'),
      ('admin.partner.detail.view', 'perm.admin.partner.detail.view', 'Partner Detail View'),
      ('admin.request.list.view', 'perm.admin.request.list.view', 'Request List View'),
      ('admin.request.detail.view', 'perm.admin.request.detail.view', 'Request Detail View'),
      ('admin.request.approve', 'perm.admin.request.approve', 'Request Approve'),
      ('admin.request.reject', 'perm.admin.request.reject', 'Request Reject'),
      ('admin.inventory.list.view', 'perm.admin.inventory.list.view', 'Inventory List View'),
      ('admin.inventory.edit', 'perm.admin.inventory.edit', 'Inventory Edit'),
      ('admin.promotion.create', 'perm.admin.promotion.create', 'Promotion Create'),
      ('admin.promotion.edit', 'perm.admin.promotion.edit', 'Promotion Edit'),
      ('admin.promotion.list.view', 'perm.admin.promotion.list.view', 'Promotion View'),
      ('admin.promotion.detail.view', 'perm.admin.promotion.detail.view', 'Promotion Detail View'),
      ('admin.promotion.submit', 'perm.admin.promotion.submit', 'Promotion Submit'),
      ('admin.promotion.status.update', 'perm.admin.promotion.status.update', 'Promotion Status Update'),
      ('admin.promotion.target.create', 'perm.admin.promotion.target.create', 'Promotion Target Create'),
      ('admin.promotion.target.edit', 'perm.admin.promotion.target.edit', 'Promotion Target Edit'),
      ('admin.promotion.target.view', 'perm.admin.promotion.target.view', 'Promotion Target View'),
      ('admin.promotion.target.delete', 'perm.admin.promotion.target.delete', 'Promotion Target Delete'),
      ('admin.promotion.target.accept', 'perm.admin.promotion.target.accept', 'Promotion Target Accept'),
      ('admin.promotion.eligibility.create', 'perm.admin.promotion.eligibility.create', 'Promotion Eligibility Create'),
      ('admin.promotion.eligibility.edit', 'perm.admin.promotion.eligibility.edit', 'Promotion Eligibility Edit'),
      ('admin.promotion.eligibility.view', 'perm.admin.promotion.eligibility.view', 'Promotion Eligibility View'),
      ('admin.promotion.code.create', 'perm.admin.promotion.code.create', 'Promotion Code Create'),
      ('admin.promotion.code.edit', 'perm.admin.promotion.code.edit', 'Promotion Code Edit'),
      ('admin.promotion.code.view', 'perm.admin.promotion.code.view', 'Promotion Code View'),
      ('admin.promotion.audienceRule.create', 'perm.admin.promotion.audienceRule.create', 'Promotion Audience Rule Create'),
      ('admin.promotion.audienceRule.edit', 'perm.admin.promotion.audienceRule.edit', 'Promotion Audience Rule Edit'),
      ('admin.promotion.audienceRule.view', 'perm.admin.promotion.audienceRule.view', 'Promotion Audience Rule View')
    ON CONFLICT (key) DO UPDATE SET
      label_key = EXCLUDED.label_key,
      name = EXCLUDED.name;
  `);

  pgm.sql(`
    INSERT INTO admin_roles (name, description, is_active)
    VALUES ('superadmin', 'Full access to all admin permissions', true)
    ON CONFLICT (name) DO NOTHING;
  `);

  pgm.sql(`
    INSERT INTO admin_role_permissions (role_id, permission_id)
    SELECT r.id, p.id
    FROM admin_roles r
    CROSS JOIN admin_permissions p
    WHERE r.name = 'superadmin'
    ON CONFLICT (role_id, permission_id) DO NOTHING;
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    DELETE FROM admin_role_permissions arp
    USING admin_roles r
    WHERE arp.role_id = r.id AND r.name = 'superadmin';
  `);

  pgm.sql(`
    DELETE FROM admin_permissions WHERE key LIKE 'admin.%';
  `);
};
