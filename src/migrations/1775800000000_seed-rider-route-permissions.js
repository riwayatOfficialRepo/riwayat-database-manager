/**
 * Add rider route-level permissions for newly added rider/profile/media/document/vehicle endpoints
 * and grant them to default Rider role.
 */
exports.up = (pgm) => {
  pgm.sql(`
    INSERT INTO rider_permissions (key, label_key, name) VALUES
      ('rider.profile.get', 'perm.rider.profile.get', 'GET /profile — fetch own rider profile'),
      ('rider.media.upload', 'perm.rider.media.upload', 'POST /media — upload rider media'),
      ('rider.vehicle.create', 'perm.rider.vehicle.create', 'POST /vehicles — create rider vehicle'),
      ('rider.vehicle.update', 'perm.rider.vehicle.update', 'PATCH /vehicles/:vehicleId — update rider vehicle'),
      ('rider.vehicle.status.change', 'perm.rider.vehicle.status.change', 'PATCH /vehicles/:vehicleId/status — update rider vehicle status'),
      ('rider.vehicle.media.upload', 'perm.rider.vehicle.media.upload', 'POST /vehicles/:vehicleId/media — upload rider vehicle media'),
      ('rider.document.media.upload', 'perm.rider.document.media.upload', 'POST /documents/media — upload rider document media'),
      ('rider.document.list', 'perm.rider.document.list', 'GET /documents — list rider documents'),
      ('rider.document.detail', 'perm.rider.document.detail', 'GET /documents/:documentId — rider document detail')
    ON CONFLICT (key) DO UPDATE SET
      label_key = EXCLUDED.label_key,
      name = EXCLUDED.name;
  `);

  pgm.sql(`
    INSERT INTO rider_role_permissions (role_id, permission_id)
    SELECT r.id, p.id
    FROM rider_roles r
    INNER JOIN rider_permissions p ON p.key IN (
      'rider.profile.get',
      'rider.media.upload',
      'rider.vehicle.create',
      'rider.vehicle.update',
      'rider.vehicle.status.change',
      'rider.vehicle.media.upload',
      'rider.document.media.upload',
      'rider.document.list',
      'rider.document.detail'
    )
    WHERE r.name = 'Rider' AND r.status = 'ACTIVE'
    ON CONFLICT (role_id, permission_id) DO NOTHING;
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    DELETE FROM rider_role_permissions rrp
    USING rider_permissions p
    WHERE rrp.permission_id = p.id
      AND p.key IN (
        'rider.profile.get',
        'rider.media.upload',
        'rider.vehicle.create',
        'rider.vehicle.update',
        'rider.vehicle.status.change',
        'rider.vehicle.media.upload',
        'rider.document.media.upload',
        'rider.document.list',
        'rider.document.detail'
      );
  `);

  pgm.sql(`
    DELETE FROM rider_permissions
    WHERE key IN (
      'rider.profile.get',
      'rider.media.upload',
      'rider.vehicle.create',
      'rider.vehicle.update',
      'rider.vehicle.status.change',
      'rider.vehicle.media.upload',
      'rider.document.media.upload',
      'rider.document.list',
      'rider.document.detail'
    );
  `);
};
