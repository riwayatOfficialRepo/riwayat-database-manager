/**
 * Add rider vehicle list permission and grant to default Rider role.
 */
exports.up = (pgm) => {
  pgm.sql(`
    INSERT INTO rider_permissions (key, label_key, name) VALUES
      ('rider.vehicle.list', 'perm.rider.vehicle.list', 'GET /vehicles — list rider vehicles')
    ON CONFLICT (key) DO UPDATE SET
      label_key = EXCLUDED.label_key,
      name = EXCLUDED.name;
  `);

  pgm.sql(`
    INSERT INTO rider_role_permissions (role_id, permission_id)
    SELECT r.id, p.id
    FROM rider_roles r
    INNER JOIN rider_permissions p ON p.key = 'rider.vehicle.list'
    WHERE r.name = 'Rider' AND r.status = 'ACTIVE'
    ON CONFLICT (role_id, permission_id) DO NOTHING;
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    DELETE FROM rider_role_permissions rrp
    USING rider_permissions p
    WHERE rrp.permission_id = p.id
      AND p.key = 'rider.vehicle.list';
  `);

  pgm.sql(`
    DELETE FROM rider_permissions
    WHERE key = 'rider.vehicle.list';
  `);
};
