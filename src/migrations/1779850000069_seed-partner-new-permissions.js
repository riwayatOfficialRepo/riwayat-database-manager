exports.up = (pgm) => {
  // ── seed new kitchen permissions ──────────────────────────────
  pgm.sql(`
    INSERT INTO kitchen_permissions (key) VALUES
      ('dish.media.edit'),
      ('dish.media.publish'),
      ('inventory.view'),
      ('inventory.generate'),
      ('inventory.edit'),
      ('admin.feedback.list.view'),
      ('admin.feedback.detail.view'),
      ('admin.feedback.edit')
    ON CONFLICT (key) DO NOTHING;
  `);

  // ── seed chef role ─────────────────────────────────────────────
  pgm.sql(`
    INSERT INTO kitchen_roles (name, description, status)
    VALUES ('chef', 'Kitchen chef with operational access', 'ACTIVE')
    ON CONFLICT (name) DO NOTHING;
  `);

  // ── assign new permissions to owner ───────────────────────────
  pgm.sql(`
    INSERT INTO kitchen_role_permissions (role_id, permission_id)
    SELECT r.id, p.id
    FROM kitchen_roles r, kitchen_permissions p
    WHERE r.name = 'owner'
      AND p.key IN (
        'dish.media.edit',
        'dish.media.publish',
        'inventory.view',
        'inventory.generate',
        'inventory.edit',
        'admin.feedback.list.view',
        'admin.feedback.detail.view',
        'admin.feedback.edit'
      )
    ON CONFLICT (role_id, permission_id) DO NOTHING;
  `);

  // ── assign chef permissions ────────────────────────────────────
  // Kitchen: operational access only (no create/delete/submit/invite management)
  // Dish: all permissions including new media.edit and media.publish
  // Inventory: all
  // Feedback: view and edit
  // Promotions: owner-only (excluded)
  // Invitations: management is owner-only; accept uses a token (no permission needed)
  pgm.sql(`
    INSERT INTO kitchen_role_permissions (role_id, permission_id)
    SELECT r.id, p.id
    FROM kitchen_roles r, kitchen_permissions p
    WHERE r.name = 'chef'
      AND p.key IN (
        'kitchen.list.view',
        'kitchen.detail.view',
        'kitchen.availability.add',
        'kitchen.availability.view',
        'kitchen.media.create',
        'kitchen.media.delete',
        'kitchen.media.list.view',
        'kitchen.dish.list.view',
        'kitchen.chef.story.create',
        'kitchen.chef.story.edit',
        'kitchen.chef.story.list.view',
        'dish.create',
        'dish.edit',
        'dish.list.view',
        'dish.detail.view',
        'dish.variant.create',
        'dish.variant.list.view',
        'dish.variant.detail.view',
        'dish.variant.edit',
        'dish.variant.item.create',
        'dish.variant.item.edit',
        'dish.variant.item.detail.view',
        'dish.variant.item.list.view',
        'dish.variant.item.delete',
        'dish.availability.add',
        'dish.availability.view',
        'dish.specialEvent.create',
        'dish.specialEvent.edit',
        'dish.specialEvent.list.view',
        'dish.specialEvent.detail.view',
        'dish.media.upload',
        'dish.media.edit',
        'dish.media.publish',
        'dish.media.delete',
        'dish.media.list.view',
        'dish.submit',
        'dish.addon.create',
        'dish.addon.edit',
        'dish.addon.list.view',
        'dish.addon.detail.view',
        'dish.modifier.create',
        'dish.modifier.edit',
        'dish.modifier.list.view',
        'dish.modifier.detail.view',
        'dish.recommended.create',
        'dish.recommended.edit',
        'dish.recommended.list.view',
        'inventory.view',
        'inventory.generate',
        'inventory.edit',
        'admin.feedback.list.view',
        'admin.feedback.detail.view',
        'admin.feedback.edit'
      )
    ON CONFLICT (role_id, permission_id) DO NOTHING;
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    DELETE FROM kitchen_role_permissions
    WHERE role_id = (SELECT id FROM kitchen_roles WHERE name = 'chef');
  `);

  pgm.sql(`
    DELETE FROM kitchen_role_permissions
    WHERE role_id = (SELECT id FROM kitchen_roles WHERE name = 'owner')
      AND permission_id IN (
        SELECT id FROM kitchen_permissions WHERE key IN (
          'dish.media.edit',
          'dish.media.publish',
          'inventory.view',
          'inventory.generate',
          'inventory.edit',
          'admin.feedback.list.view',
          'admin.feedback.detail.view',
          'admin.feedback.edit'
        )
      );
  `);

  pgm.sql(`DELETE FROM kitchen_roles WHERE name = 'chef';`);

  pgm.sql(`
    DELETE FROM kitchen_permissions WHERE key IN (
      'dish.media.edit',
      'dish.media.publish',
      'inventory.view',
      'inventory.generate',
      'inventory.edit',
      'admin.feedback.list.view',
      'admin.feedback.detail.view',
      'admin.feedback.edit'
    );
  `);
};
