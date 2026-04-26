/**
 * Follow-up migration: ensure rider.vehicle.list exists and is granted to role_id = 1.
 * Safe for environments where previous rider permission migrations already ran.
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
    SELECT 1, p.id
    FROM rider_permissions p
    WHERE p.key = 'rider.vehicle.list'
    ON CONFLICT (role_id, permission_id) DO NOTHING;
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    DELETE FROM rider_role_permissions rrp
    USING rider_permissions p
    WHERE rrp.permission_id = p.id
      AND rrp.role_id = 1
      AND p.key = 'rider.vehicle.list';
  `);
};
