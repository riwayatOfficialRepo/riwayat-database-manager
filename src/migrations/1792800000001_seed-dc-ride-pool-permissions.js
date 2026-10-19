/**
 * Seed the delivery company permissions for the unassigned ride pool.
 *
 * dc.ride.pool.view / claim / offer / escalate (riwayat-delivery-company-service pool routes).
 * Granted to every delivery company role that can already list rides (dc.ride.list.view).
 * Idempotent (ON CONFLICT on the key; dl_company_role_permissions has no unique pair, so NOT EXISTS).
 */

const KEYS = [
  ['dc.ride.pool.view', 'View the unassigned ride pool'],
  ['dc.ride.pool.claim', 'Claim and release a pooled ride'],
  ['dc.ride.pool.offer', 'Offer a pooled ride to a rider'],
  ['dc.ride.pool.escalate', 'Escalate a pooled ride'],
];

const keyList = KEYS.map(([key]) => `'${key}'`).join(', ');

exports.up = (pgm) => {
  pgm.sql(`
    INSERT INTO dl_company_user_permissions (key, label_key, description, status) VALUES
      ${KEYS.map(([key, description]) => `('${key}', 'perm.${key}', '${description}', 'ACTIVE')`).join(',\n      ')}
    ON CONFLICT (key) DO UPDATE SET label_key = EXCLUDED.label_key, description = EXCLUDED.description;
  `);
  pgm.sql(`
    INSERT INTO dl_company_role_permissions (role_id, permission_id)
    SELECT DISTINCT rp.role_id, p.id
    FROM dl_company_role_permissions rp
    INNER JOIN dl_company_user_permissions viewer ON viewer.id = rp.permission_id AND viewer.key = 'dc.ride.list.view'
    INNER JOIN dl_company_user_permissions p ON p.key IN (${keyList})
    WHERE NOT EXISTS (
      SELECT 1 FROM dl_company_role_permissions existing WHERE existing.role_id = rp.role_id AND existing.permission_id = p.id
    );
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    DELETE FROM dl_company_role_permissions rp USING dl_company_user_permissions p
    WHERE rp.permission_id = p.id AND p.key IN (${keyList});
  `);
  pgm.sql(`DELETE FROM dl_company_user_permissions WHERE key IN (${keyList});`);
};
