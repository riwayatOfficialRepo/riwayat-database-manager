exports.up = (pgm) => {
  pgm.sql(`
    INSERT INTO admin_permissions (key) VALUES
      -- USER
      ('admin.user.reset.pin'),
      -- KITCHEN media
      ('admin.kitchen.media.edit'),
      ('admin.kitchen.media.publish'),
      -- KITCHEN chef story
      ('admin.kitchen.chefStory.create'),
      ('admin.kitchen.chefStory.edit'),
      ('admin.kitchen.chefStory.list.view'),
      -- KITCHEN user docs
      ('admin.kitchen.userDoc.create'),
      ('admin.kitchen.userDoc.list.view'),
      -- KITCHEN invitations
      ('admin.kitchen.user.invite'),
      ('admin.kitchen.invitation.resend'),
      ('admin.kitchen.invitation.revoke'),
      ('admin.kitchen.invitation.accept'),
      ('admin.kitchen.invitation.reject'),
      ('admin.kitchen.invitation.list.view'),
      -- KITCHEN onboarding & menu
      ('admin.kitchen.onboarding.submit'),
      ('admin.kitchen.menu.create'),
      ('admin.kitchen.menu.edit'),
      ('admin.kitchen.menu.delete'),
      ('admin.kitchen.menu.list.view'),
      ('admin.kitchen.menu.detail.view'),
      -- DISH media
      ('admin.dish.media.edit'),
      ('admin.dish.media.publish'),
      -- REQUEST
      ('admin.request.reject')
    ON CONFLICT (key) DO NOTHING;
  `);

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
      'admin.user.reset.pin',
      'admin.kitchen.media.edit',
      'admin.kitchen.media.publish',
      'admin.kitchen.chefStory.create',
      'admin.kitchen.chefStory.edit',
      'admin.kitchen.chefStory.list.view',
      'admin.kitchen.userDoc.create',
      'admin.kitchen.userDoc.list.view',
      'admin.kitchen.user.invite',
      'admin.kitchen.invitation.resend',
      'admin.kitchen.invitation.revoke',
      'admin.kitchen.invitation.accept',
      'admin.kitchen.invitation.reject',
      'admin.kitchen.invitation.list.view',
      'admin.kitchen.onboarding.submit',
      'admin.kitchen.menu.create',
      'admin.kitchen.menu.edit',
      'admin.kitchen.menu.delete',
      'admin.kitchen.menu.list.view',
      'admin.kitchen.menu.detail.view',
      'admin.dish.media.edit',
      'admin.dish.media.publish',
      'admin.request.reject'
    );
  `);
};
