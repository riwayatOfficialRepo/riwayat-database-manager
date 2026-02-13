/**
 * Seed Script
 *
 * Seeds the database with sample data for kitchens and related mapping tables.
 * Skips: kitchen_addresses, kitchen_availability, kitchen_media tables.
 *
 * Usage: npm run seed
 */

const { pool, connectDB } = require('../database');
const logger = require('../logger');

async function seed() {
  try {
    await connectDB();
    logger.info('Starting database seeding...');

    // ── 1. Kitchens ──────────────────────────────────────────────
    const kitchensResult = await pool.query(`
      INSERT INTO kitchens (name, tagline, bio, is_logo_available, status, kitchen_business_ref, activated_at)
      VALUES
        ('Al Bayt Kitchen', 'Authentic Home-Style Arabic Cuisine', 'A family-run kitchen specializing in traditional Arabic dishes passed down through generations. Known for signature kabsa and freshly baked bread.', true, 'active', 'KBR-001', NOW()),
        ('Spice Route Kitchen', 'Where Spices Tell Stories', 'A fusion kitchen blending Middle Eastern and South Asian flavors. Famous for biryanis, shawarma wraps, and house-made spice blends.', true, 'active', 'KBR-002', NOW()),
        ('Green Oasis Kitchen', 'Fresh, Healthy, Delicious', 'A health-conscious kitchen offering wholesome meals with locally sourced ingredients. Specializes in salads, grain bowls, and fresh juices.', false, 'pending', 'KBR-003', NULL)
      ON CONFLICT (name) DO NOTHING
      RETURNING id, name;
    `);

    const kitchens = kitchensResult.rows;
    if (kitchens.length === 0) {
      logger.info('Kitchens already seeded, fetching existing...');
      const existing = await pool.query(`SELECT id, name FROM kitchens WHERE name IN ('Al Bayt Kitchen', 'Spice Route Kitchen', 'Green Oasis Kitchen') ORDER BY kitchen_business_ref`);
      kitchens.push(...existing.rows);
    }
    logger.info({ count: kitchens.length }, 'Kitchens seeded');

    // ── 2. Kitchens Staging ──────────────────────────────────────
    for (const kitchen of kitchens) {
      await pool.query(`
        INSERT INTO kitchens_staging (kitchen_id, name, tagline, bio, is_logo_available, status, kitchen_business_ref)
        SELECT $1, name, tagline, bio, is_logo_available, 'draft', kitchen_business_ref
        FROM kitchens WHERE id = $1
        ON CONFLICT (kitchen_id) DO NOTHING
      `, [kitchen.id]);
    }
    logger.info('Kitchens staging seeded');

    // ── 3. Kitchen Roles ─────────────────────────────────────────
    await pool.query(`
      INSERT INTO kitchen_roles (name, label_key, description, status)
      VALUES
        ('owner', 'role.owner', 'Full access to kitchen management, billing, and settings', 'ACTIVE'),
        ('manager', 'role.manager', 'Can manage menu, orders, and staff schedules', 'ACTIVE'),
        ('chef', 'role.chef', 'Can view and update orders and menu items', 'ACTIVE')
      ON CONFLICT (name) DO NOTHING;
    `);
    const rolesResult = await pool.query(`SELECT id, name FROM kitchen_roles WHERE name IN ('owner', 'manager', 'chef')`);
    const roles = {};
    rolesResult.rows.forEach(r => { roles[r.name] = r.id; });
    logger.info('Kitchen roles seeded');

    // ── 4. Kitchen Permissions ───────────────────────────────────
    await pool.query(`
      INSERT INTO kitchen_permissions (key, label_key, name, description)
      VALUES
        ('kitchen.manage', 'perm.kitchen.manage', 'Manage Kitchen', 'Create, update, and delete kitchen settings'),
        ('menu.manage', 'perm.menu.manage', 'Manage Menu', 'Create, update, and delete menu items'),
        ('order.view', 'perm.order.view', 'View Orders', 'View incoming and past orders'),
        ('order.manage', 'perm.order.manage', 'Manage Orders', 'Accept, reject, and update order status'),
        ('staff.manage', 'perm.staff.manage', 'Manage Staff', 'Invite, remove, and assign roles to staff'),
        ('analytics.view', 'perm.analytics.view', 'View Analytics', 'View kitchen performance and analytics')
      ON CONFLICT (key) DO NOTHING;
    `);
    const permsResult = await pool.query(`SELECT id, key FROM kitchen_permissions WHERE key IN ('kitchen.manage', 'menu.manage', 'order.view', 'order.manage', 'staff.manage', 'analytics.view')`);
    const perms = {};
    permsResult.rows.forEach(p => { perms[p.key] = p.id; });
    logger.info('Kitchen permissions seeded');

    // ── 5. Kitchen Role Permissions (mapping) ────────────────────
    // Owner gets all permissions
    // Manager gets menu, orders, and analytics
    // Chef gets order view and order manage
    const rolePermMappings = [
      // Owner
      [roles.owner, perms['kitchen.manage']],
      [roles.owner, perms['menu.manage']],
      [roles.owner, perms['order.view']],
      [roles.owner, perms['order.manage']],
      [roles.owner, perms['staff.manage']],
      [roles.owner, perms['analytics.view']],
      // Manager
      [roles.manager, perms['menu.manage']],
      [roles.manager, perms['order.view']],
      [roles.manager, perms['order.manage']],
      [roles.manager, perms['analytics.view']],
      // Chef
      [roles.chef, perms['order.view']],
      [roles.chef, perms['order.manage']],
    ];

    for (const [roleId, permId] of rolePermMappings) {
      await pool.query(`
        INSERT INTO kitchen_role_permissions (role_id, permission_id)
        VALUES ($1, $2)
        ON CONFLICT (role_id, permission_id) DO NOTHING
      `, [roleId, permId]);
    }
    logger.info('Kitchen role permissions seeded');

    // ── 6. Kitchen Users ─────────────────────────────────────────
    const usersData = [
      { kitchen: kitchens[0], name: 'Ahmed Al-Rashid', phone: '+966500000001', email: 'ahmed@albayt.com', isPrimary: true, gender: 'male' },
      { kitchen: kitchens[1], name: 'Fatima Hassan', phone: '+966500000002', email: 'fatima@spiceroute.com', isPrimary: true, gender: 'female' },
      { kitchen: kitchens[2], name: 'Omar Khalil', phone: '+966500000003', email: 'omar@greenoasis.com', isPrimary: true, gender: 'male' },
    ];

    const userIds = [];
    for (const u of usersData) {
      const res = await pool.query(`
        INSERT INTO kitchen_users (kitchen_id, name, phone, email, bio, is_kyc_verified, status, is_primary_owner, gender)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (phone) DO NOTHING
        RETURNING id
      `, [u.kitchen.id, u.name, u.phone, u.email, `Primary owner of ${u.kitchen.name}`, u.kitchen.name !== 'Green Oasis Kitchen', u.kitchen.name !== 'Green Oasis Kitchen' ? 'active' : 'pending', u.isPrimary, u.gender]);

      if (res.rows.length > 0) {
        userIds.push(res.rows[0].id);
      } else {
        const existing = await pool.query(`SELECT id FROM kitchen_users WHERE phone = $1`, [u.phone]);
        userIds.push(existing.rows[0].id);
      }
    }
    logger.info({ count: userIds.length }, 'Kitchen users seeded');

    // ── 7. Kitchen User Roles (mapping) ──────────────────────────
    // All primary owners get the "owner" role
    for (const userId of userIds) {
      await pool.query(`
        INSERT INTO kitchen_user_roles (kitchen_user_id, role_id, status)
        VALUES ($1, $2, 'ACTIVE')
        ON CONFLICT (kitchen_user_id, role_id) DO NOTHING
      `, [userId, roles.owner]);
    }
    logger.info('Kitchen user roles seeded');

    // ── Summary ──────────────────────────────────────────────────
    console.log('\n========================================');
    console.log('  SEED SUMMARY');
    console.log('========================================');
    console.log('  kitchens:                 3 entries');
    console.log('  kitchens_staging:         3 entries');
    console.log('  kitchen_roles:            3 entries');
    console.log('  kitchen_permissions:      6 entries');
    console.log('  kitchen_role_permissions: 12 entries');
    console.log('  kitchen_users:            3 entries');
    console.log('  kitchen_user_roles:       3 entries');
    console.log('========================================');
    console.log('\nSeeding complete!\n');

    process.exit(0);
  } catch (error) {
    logger.error({ error }, 'Seeding failed');
    console.error('Seeding failed:', error.message);
    process.exit(1);
  }
}

seed();
