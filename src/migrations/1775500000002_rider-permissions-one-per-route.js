/**
 * One permission per rider HTTP route: replace consolidated PIN + profile.update
 * with route-specific keys. Idempotent for DBs seeded before 1775500000001 was updated.
 */
exports.up = (pgm) => {
  pgm.sql(`
    INSERT INTO rider_permissions (key, label_key, name) VALUES
      ('rider.auth.pin.set', 'perm.rider.auth.pin.set', 'POST /auth/set-pin — set PIN (first time)'),
      ('rider.auth.pin.change', 'perm.rider.auth.pin.change', 'POST /auth/change-pin — change PIN'),
      ('rider.auth.token.refresh', 'perm.rider.auth.token.refresh', 'POST /auth/refresh — refresh tokens'),
      ('rider.profile.patch', 'perm.rider.profile.patch', 'PATCH /profile — update rider profile'),
      ('rider.prospect.onboarding.submit', 'perm.rider.prospect.onboarding.submit', 'POST /prospect/onboarding — submit onboarding')
    ON CONFLICT (key) DO UPDATE SET
      label_key = EXCLUDED.label_key,
      name = EXCLUDED.name;
  `);

  pgm.sql(`
    DELETE FROM rider_role_permissions crp
    USING rider_permissions p
    WHERE crp.permission_id = p.id
      AND p.key IN (
        'rider.credentials.pin.manage',
        'rider.profile.update'
      );
  `);

  pgm.sql(`
    DELETE FROM rider_permissions
    WHERE key IN ('rider.credentials.pin.manage', 'rider.profile.update');
  `);

  pgm.sql(`
    INSERT INTO rider_role_permissions (role_id, permission_id)
    SELECT r.id, p.id
    FROM rider_roles r
    INNER JOIN rider_permissions p ON p.key LIKE 'rider.%'
    WHERE r.name = 'Rider' AND r.status = 'ACTIVE'
    ON CONFLICT (role_id, permission_id) DO NOTHING;
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    DELETE FROM rider_role_permissions crp
    USING rider_permissions p
    WHERE crp.permission_id = p.id
      AND p.key IN (
        'rider.auth.pin.set',
        'rider.auth.pin.change',
        'rider.auth.token.refresh',
        'rider.profile.patch'
      );
  `);

  pgm.sql(`
    DELETE FROM rider_permissions
    WHERE key IN (
      'rider.auth.pin.set',
      'rider.auth.pin.change',
      'rider.auth.token.refresh',
      'rider.profile.patch'
    );
  `);

  pgm.sql(`
    INSERT INTO rider_permissions (key, label_key, name) VALUES
      ('rider.profile.update', 'perm.rider.profile.update', 'Update own rider profile'),
      ('rider.credentials.pin.manage', 'perm.rider.credentials.pin.manage', 'Set or change rider PIN')
    ON CONFLICT (key) DO NOTHING;
  `);

  pgm.sql(`
    INSERT INTO rider_role_permissions (role_id, permission_id)
    SELECT r.id, p.id
    FROM rider_roles r
    INNER JOIN rider_permissions p ON p.key IN ('rider.profile.update', 'rider.credentials.pin.manage', 'rider.prospect.onboarding.submit')
    WHERE r.name = 'Rider' AND r.status = 'ACTIVE'
    ON CONFLICT (role_id, permission_id) DO NOTHING;
  `);
};
