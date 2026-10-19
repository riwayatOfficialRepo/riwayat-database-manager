exports.up = (pgm) => {

  // ── ADMIN / TEAM permissions ────────────────────────────────────
  pgm.sql(`
    INSERT INTO admin_permissions (key) VALUES
      ('case.create'),
      ('case.takeOwnership'),
      ('case.createActivity'),
      ('case.updatePriority'),
      ('case.closeCase'),
      ('case.reopen'),
      ('case.resolve'),
      ('case.uploadCaseMedia'),
      ('case.list.view'),
      ('case.detail.view'),
      ('case.list.by.entity'),
      ('case.activities.view'),
      ('help_ticket.list.view'),
      ('help_ticket.detail.view'),
      ('help_ticket.comment.add'),
      ('help_ticket.status.update'),
      ('help_ticket.case.link')
    ON CONFLICT (key) DO NOTHING;
  `);

  pgm.sql(`
    INSERT INTO admin_role_permissions (role_id, permission_id)
    SELECT r.id, p.id
    FROM admin_roles r, admin_permissions p
    WHERE r.name = 'superadmin'
      AND p.key IN (
        'case.create', 'case.takeOwnership', 'case.createActivity',
        'case.updatePriority', 'case.closeCase', 'case.reopen', 'case.resolve',
        'case.uploadCaseMedia', 'case.list.view', 'case.detail.view',
        'case.list.by.entity', 'case.activities.view',
        'help_ticket.list.view', 'help_ticket.detail.view', 'help_ticket.comment.add',
        'help_ticket.status.update', 'help_ticket.case.link'
      )
    ON CONFLICT (role_id, permission_id) DO NOTHING;
  `);

  // ── KITCHEN permissions ─────────────────────────────────────────
  pgm.sql(`
    INSERT INTO kitchen_permissions (key) VALUES
      ('kitchen.case.create'),
      ('kitchen.case.list.view'),
      ('kitchen.case.detail.view'),
      ('kitchen.case.comment.add')
    ON CONFLICT (key) DO NOTHING;
  `);

  // ensure chef role exists
  pgm.sql(`
    INSERT INTO kitchen_roles (name, description, status)
    VALUES ('chef', 'Chef access to kitchen features', 'ACTIVE')
    ON CONFLICT (name) DO NOTHING;
  `);

  // assign case permissions to both owner and chef
  pgm.sql(`
    INSERT INTO kitchen_role_permissions (role_id, permission_id)
    SELECT r.id, p.id
    FROM kitchen_roles r, kitchen_permissions p
    WHERE r.name IN ('owner', 'chef')
      AND p.key IN ('kitchen.case.create', 'kitchen.case.list.view', 'kitchen.case.detail.view', 'kitchen.case.comment.add')
    ON CONFLICT (role_id, permission_id) DO NOTHING;
  `);

  // ── CUSTOMER permissions ────────────────────────────────────────
  pgm.sql(`
    INSERT INTO customer_permissions (key, label_key, name) VALUES
      ('customer.case.create',      'perm.customer.case.create',      'Create case'),
      ('customer.case.list.view',   'perm.customer.case.list.view',   'List cases'),
      ('customer.case.detail.view', 'perm.customer.case.detail.view', 'View case detail'),
      ('customer.case.comment.add', 'perm.customer.case.comment.add', 'Add case comment')
    ON CONFLICT (key) DO UPDATE SET
      label_key = EXCLUDED.label_key,
      name = EXCLUDED.name;
  `);

  pgm.sql(`
    INSERT INTO customer_role_permissions (role_id, permission_id)
    SELECT r.id, p.id
    FROM customer_roles r, customer_permissions p
    WHERE r.name = 'Customer' AND r.status = 'ACTIVE'
      AND p.key IN (
        'customer.case.create', 'customer.case.list.view',
        'customer.case.detail.view', 'customer.case.comment.add'
      )
    ON CONFLICT (role_id, permission_id) DO NOTHING;
  `);

  // ── RIDER permissions ───────────────────────────────────────────
  pgm.sql(`
    INSERT INTO rider_permissions (key, label_key, name) VALUES
      ('rider.case.comment.add', 'perm.rider.case.comment.add', 'Add case comment')
    ON CONFLICT (key) DO UPDATE SET
      label_key = EXCLUDED.label_key,
      name = EXCLUDED.name;
  `);

  // ensure Rider role exists
  pgm.sql(`
    INSERT INTO rider_roles (name, description, status)
    VALUES ('Rider', 'Default rider role', 'ACTIVE')
    ON CONFLICT (name) DO NOTHING;
  `);

  pgm.sql(`
    INSERT INTO rider_role_permissions (role_id, permission_id)
    SELECT r.id, p.id
    FROM rider_roles r, rider_permissions p
    WHERE r.name = 'Rider'
      AND p.key = 'rider.case.comment.add'
    ON CONFLICT (role_id, permission_id) DO NOTHING;
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    DELETE FROM admin_permissions WHERE key IN (
      'case.create', 'case.takeOwnership', 'case.createActivity',
      'case.updatePriority', 'case.closeCase', 'case.reopen', 'case.resolve',
      'case.uploadCaseMedia', 'case.list.by.entity', 'case.activities.view',
      'help_ticket.list.view', 'help_ticket.detail.view', 'help_ticket.comment.add',
      'help_ticket.status.update', 'help_ticket.case.link'
    );
  `);

  pgm.sql(`
    DELETE FROM kitchen_permissions WHERE key IN (
      'kitchen.case.create', 'kitchen.case.list.view', 'kitchen.case.detail.view', 'kitchen.case.comment.add'
    );
  `);

  pgm.sql(`
    DELETE FROM customer_permissions WHERE key IN (
      'customer.case.create', 'customer.case.list.view',
      'customer.case.detail.view', 'customer.case.comment.add'
    );
  `);

  pgm.sql(`
    DELETE FROM rider_permissions WHERE key = 'rider.case.comment.add';
  `);
};
