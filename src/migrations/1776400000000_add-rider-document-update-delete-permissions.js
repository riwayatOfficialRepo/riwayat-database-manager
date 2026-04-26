/**
 * Add rider.document.update and rider.document.delete permissions
 * and grant them to default Rider role (role_id = 1).
 */
exports.up = (pgm) => {
  pgm.sql(`
    INSERT INTO rider_permissions (key, label_key, name) VALUES
      ('rider.document.update', 'perm.rider.document.update', 'PATCH /documents/:documentId — update rider document'),
      ('rider.document.delete', 'perm.rider.document.delete', 'DELETE /documents/:documentId — soft delete rider document')
    ON CONFLICT (key) DO UPDATE SET
      label_key = EXCLUDED.label_key,
      name = EXCLUDED.name;
  `);

  pgm.sql(`
    INSERT INTO rider_role_permissions (role_id, permission_id)
    SELECT 1, p.id
    FROM rider_permissions p
    WHERE p.key IN ('rider.document.update', 'rider.document.delete')
    ON CONFLICT (role_id, permission_id) DO NOTHING;
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    DELETE FROM rider_role_permissions rrp
    USING rider_permissions p
    WHERE rrp.permission_id = p.id
      AND rrp.role_id = 1
      AND p.key IN ('rider.document.update', 'rider.document.delete');
  `);
};
