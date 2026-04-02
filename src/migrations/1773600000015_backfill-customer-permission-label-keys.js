/**
 * Backfill customer_permissions.label_key for rows seeded before label_key was added.
 * Convention matches kitchen_permissions in seed.js: perm.<full.permission.key>
 */
exports.up = (pgm) => {
  pgm.sql(`
    UPDATE customer_permissions
    SET label_key = 'perm.' || key
    WHERE key LIKE 'customer.%'
      AND (label_key IS NULL OR label_key = '');
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    UPDATE customer_permissions
    SET label_key = NULL
    WHERE key LIKE 'customer.%'
      AND label_key = ('perm.' || key);
  `);
};
