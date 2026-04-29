/**
 * Default "Rider" role, rider.* permissions, grants, and backfill rider_user_roles
 * for all existing riders (idempotent).
 */
exports.up = (pgm) => {
  pgm.sql(`
    INSERT INTO rider_roles (name, label_key, description, status)
    VALUES ('Rider', 'role.rider', 'Default rider app role', 'ACTIVE')
    ON CONFLICT (name) DO UPDATE SET
      label_key = EXCLUDED.label_key,
      description = EXCLUDED.description,
      status = EXCLUDED.status;
  `);

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
    INSERT INTO rider_role_permissions (role_id, permission_id)
    SELECT r.id, p.id
    FROM rider_roles r
    INNER JOIN rider_permissions p ON p.key LIKE 'rider.%'
    WHERE r.name = 'Rider' AND r.status = 'ACTIVE'
    ON CONFLICT (role_id, permission_id) DO NOTHING;
  `);

  pgm.sql(`
    INSERT INTO rider_user_roles (rider_id, role_id, status)
    SELECT rd.rider_id, r.id, 'ACTIVE'
    FROM riders rd
    CROSS JOIN rider_roles r
    WHERE r.name = 'Rider' AND r.status = 'ACTIVE'
      AND NOT EXISTS (
        SELECT 1 FROM rider_user_roles ur
        WHERE ur.rider_id = rd.rider_id AND ur.role_id = r.id
      );
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    DELETE FROM rider_user_roles ur
    USING rider_roles r
    WHERE ur.role_id = r.id AND r.name = 'Rider';
  `);

  pgm.sql(`
    DELETE FROM rider_role_permissions rrp
    USING rider_permissions p, rider_roles r
    WHERE rrp.permission_id = p.id
      AND rrp.role_id = r.id
      AND r.name = 'Rider'
      AND p.key LIKE 'rider.%';
  `);

  pgm.sql(`
    DELETE FROM rider_permissions WHERE key LIKE 'rider.%';
  `);

  pgm.sql(`
    DELETE FROM rider_roles WHERE name = 'Rider';
  `);
};
