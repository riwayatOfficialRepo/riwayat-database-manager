/**
 * Seed the admin Featured Merchandising permissions and grant them to admin role 'superadmin'
 *
 * Featured kitchens, featured dishes and featured chef stories in the admin portal: list, detail,
 * create, edit and delete drafts, submit for approval, cancel (remove) and reorder placements.
 * Approving a submitted placement uses the existing admin.request.approve. Idempotent (ON CONFLICT).
 */

const KEYS = [
  ['admin.merchandising.featured.kitchen.list.view', 'View featured kitchens'],
  ['admin.merchandising.featured.kitchen.detail.view', 'View featured kitchen details'],
  ['admin.merchandising.featured.kitchen.create', 'Create featured kitchens'],
  ['admin.merchandising.featured.kitchen.edit', 'Edit featured kitchens'],
  ['admin.merchandising.featured.kitchen.delete', 'Delete featured kitchen drafts'],
  ['admin.merchandising.featured.kitchen.submit', 'Submit featured kitchens for approval'],
  ['admin.merchandising.featured.kitchen.cancel', 'Cancel featured kitchens'],
  ['admin.merchandising.featured.kitchen.reorder', 'Reorder featured kitchens'],
  ['admin.merchandising.featured.dish.list.view', 'View featured dishes'],
  ['admin.merchandising.featured.dish.detail.view', 'View featured dish details'],
  ['admin.merchandising.featured.dish.create', 'Create featured dishes'],
  ['admin.merchandising.featured.dish.edit', 'Edit featured dishes'],
  ['admin.merchandising.featured.dish.delete', 'Delete featured dish drafts'],
  ['admin.merchandising.featured.dish.submit', 'Submit featured dishes for approval'],
  ['admin.merchandising.featured.dish.cancel', 'Cancel featured dishes'],
  ['admin.merchandising.featured.dish.reorder', 'Reorder featured dishes'],
  ['admin.merchandising.featured.chef_story.list.view', 'View featured chef stories'],
  ['admin.merchandising.featured.chef_story.detail.view', 'View featured chef story details'],
  ['admin.merchandising.featured.chef_story.create', 'Create featured chef stories'],
  ['admin.merchandising.featured.chef_story.edit', 'Edit featured chef stories'],
  ['admin.merchandising.featured.chef_story.delete', 'Delete featured chef story drafts'],
  ['admin.merchandising.featured.chef_story.submit', 'Submit featured chef stories for approval'],
  ['admin.merchandising.featured.chef_story.cancel', 'Cancel featured chef stories'],
  ['admin.merchandising.featured.chef_story.reorder', 'Reorder featured chef stories'],
];

const keyList = KEYS.map(([key]) => `'${key}'`).join(', ');

exports.up = (pgm) => {
  pgm.sql(`
    INSERT INTO admin_permissions (key, label_key, name) VALUES
      ${KEYS.map(([key, name]) => `('${key}', 'perm.${key}', '${name}')`).join(',\n      ')}
    ON CONFLICT (key) DO UPDATE SET label_key = EXCLUDED.label_key, name = EXCLUDED.name;
  `);
  pgm.sql(`
    INSERT INTO admin_role_permissions (role_id, permission_id)
    SELECT r.id, p.id FROM admin_roles r
    INNER JOIN admin_permissions p ON p.key IN (${keyList})
    WHERE r.name = 'superadmin'
    ON CONFLICT (role_id, permission_id) DO NOTHING;
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    DELETE FROM admin_role_permissions rp USING admin_permissions p
    WHERE rp.permission_id = p.id AND p.key IN (${keyList});
  `);
  pgm.sql(`DELETE FROM admin_permissions WHERE key IN (${keyList});`);
};
