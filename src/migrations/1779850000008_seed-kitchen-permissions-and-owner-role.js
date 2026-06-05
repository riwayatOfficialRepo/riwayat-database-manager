exports.up = (pgm) => {
  // ── seed owner role ───────────────────────────────────────────
  pgm.sql(`
    INSERT INTO kitchen_roles (name, description, status)
    VALUES ('owner', 'Full access to kitchen features', 'ACTIVE')
    ON CONFLICT (name) DO NOTHING;
  `);

  // ── seed kitchen_permissions ──────────────────────────────────
  pgm.sql(`
    INSERT INTO kitchen_permissions (key) VALUES
      -- KITCHEN
      ('kitchen.create'),
      ('kitchen.update'),
      ('kitchen.delete'),
      ('kitchen.list.view'),
      ('kitchen.detail.view'),
      ('kitchen.address.create'),
      ('kitchen.address.edit'),
      ('kitchen.address.list.view'),
      ('kitchen.partner.list.view'),
      ('kitchen.availability.add'),
      ('kitchen.availability.view'),
      ('kitchen.chef.invite'),
      ('kitchen.submit'),
      ('kitchen.request.list.view'),
      ('kitchen.media.create'),
      ('kitchen.media.delete'),
      ('kitchen.media.list.view'),
      ('kitchen.dish.list.view'),
      ('kitchen.user.invite.list.view'),
      ('kitchen.user.invite.send'),
      ('kitchen.user.invite.resend'),
      ('kitchen.user.invite.revoke'),
      ('kitchen.user.invite.detail.view'),
      ('kitchen.user.doc.create'),
      ('kitchen.user.doc.list.view'),
      ('kitchen.onboarding.submit'),
      ('kitchen.chef.story.create'),
      ('kitchen.chef.story.edit'),
      ('kitchen.chef.story.list.view'),
      -- DISH
      ('dish.create'),
      ('dish.edit'),
      ('dish.list.view'),
      ('dish.detail.view'),
      ('dish.variant.create'),
      ('dish.variant.list.view'),
      ('dish.variant.detail.view'),
      ('dish.variant.edit'),
      ('dish.variant.item.create'),
      ('dish.variant.item.edit'),
      ('dish.variant.item.detail.view'),
      ('dish.variant.item.list.view'),
      ('dish.variant.item.delete'),
      ('dish.availability.add'),
      ('dish.availability.view'),
      ('dish.specialEvent.create'),
      ('dish.specialEvent.edit'),
      ('dish.specialEvent.list.view'),
      ('dish.specialEvent.detail.view'),
      ('dish.media.upload'),
      ('dish.media.delete'),
      ('dish.media.list.view'),
      ('dish.submit'),
      ('dish.addon.create'),
      ('dish.addon.edit'),
      ('dish.addon.list.view'),
      ('dish.addon.detail.view'),
      ('dish.modifier.create'),
      ('dish.modifier.edit'),
      ('dish.modifier.list.view'),
      ('dish.modifier.detail.view'),
      ('dish.recommended.create'),
      ('dish.recommended.edit'),
      ('dish.recommended.list.view'),
      -- PROMOTION
      ('promotion.create'),
      ('promotion.edit'),
      ('promotion.delete'),
      ('promotion.list.view'),
      ('promotion.detail.view'),
      ('promotion.submit')
    ON CONFLICT (key) DO NOTHING;
  `);

  // ── map all permissions -> owner role ─────────────────────────
  pgm.sql(`
    INSERT INTO kitchen_role_permissions (role_id, permission_id)
    SELECT r.id, p.id
    FROM kitchen_roles r, kitchen_permissions p
    WHERE r.name = 'owner'
    ON CONFLICT (role_id, permission_id) DO NOTHING;
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    DELETE FROM kitchen_role_permissions
    WHERE role_id = (SELECT id FROM kitchen_roles WHERE name = 'owner');
  `);
  pgm.sql(`
    DELETE FROM kitchen_permissions WHERE key IN (
      'kitchen.create', 'kitchen.update', 'kitchen.delete',
      'kitchen.list.view', 'kitchen.detail.view',
      'kitchen.address.create', 'kitchen.address.edit', 'kitchen.address.list.view',
      'kitchen.partner.list.view', 'kitchen.availability.add', 'kitchen.availability.view',
      'kitchen.chef.invite', 'kitchen.submit', 'kitchen.request.list.view',
      'kitchen.media.create', 'kitchen.media.delete', 'kitchen.media.list.view',
      'kitchen.dish.list.view',
      'kitchen.user.invite.list.view', 'kitchen.user.invite.send',
      'kitchen.user.invite.resend', 'kitchen.user.invite.revoke',
      'kitchen.user.invite.detail.view',
      'kitchen.user.doc.create', 'kitchen.user.doc.list.view',
      'kitchen.onboarding.submit',
      'kitchen.chef.story.create', 'kitchen.chef.story.edit', 'kitchen.chef.story.list.view',
      'dish.create', 'dish.edit', 'dish.list.view', 'dish.detail.view',
      'dish.variant.create', 'dish.variant.list.view', 'dish.variant.detail.view', 'dish.variant.edit',
      'dish.variant.item.create', 'dish.variant.item.edit',
      'dish.variant.item.detail.view', 'dish.variant.item.list.view', 'dish.variant.item.delete',
      'dish.availability.add', 'dish.availability.view',
      'dish.specialEvent.create', 'dish.specialEvent.edit',
      'dish.specialEvent.list.view', 'dish.specialEvent.detail.view',
      'dish.media.upload', 'dish.media.delete', 'dish.media.list.view', 'dish.submit',
      'dish.addon.create', 'dish.addon.edit', 'dish.addon.list.view', 'dish.addon.detail.view',
      'dish.modifier.create', 'dish.modifier.edit', 'dish.modifier.list.view', 'dish.modifier.detail.view',
      'dish.recommended.create', 'dish.recommended.edit', 'dish.recommended.list.view',
      'promotion.create', 'promotion.edit', 'promotion.delete',
      'promotion.list.view', 'promotion.detail.view', 'promotion.submit'
    );
  `);
  pgm.sql(`DELETE FROM kitchen_roles WHERE name = 'owner'`);
};
