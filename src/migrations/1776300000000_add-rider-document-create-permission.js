/**
 * Add rider.document.create permission and grant to default Rider role (role_id = 1).
 * Also refresh rider.document.media.upload label/name for the route that now requires :documentId.
 */
exports.up = (pgm) => {
  pgm.sql(`
    INSERT INTO rider_permissions (key, label_key, name) VALUES
      ('rider.document.create', 'perm.rider.document.create', 'POST /documents — create rider document'),
      ('rider.document.media.upload', 'perm.rider.document.media.upload', 'POST /documents/:documentId/media — upload rider document media')
    ON CONFLICT (key) DO UPDATE SET
      label_key = EXCLUDED.label_key,
      name = EXCLUDED.name;
  `);

  pgm.sql(`
    INSERT INTO rider_role_permissions (role_id, permission_id)
    SELECT 1, p.id
    FROM rider_permissions p
    WHERE p.key IN ('rider.document.create', 'rider.document.media.upload')
    ON CONFLICT (role_id, permission_id) DO NOTHING;
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    DELETE FROM rider_role_permissions rrp
    USING rider_permissions p
    WHERE rrp.permission_id = p.id
      AND rrp.role_id = 1
      AND p.key IN ('rider.document.create', 'rider.document.media.upload');
  `);
};
