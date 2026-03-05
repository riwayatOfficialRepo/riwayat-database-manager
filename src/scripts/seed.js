/**
 * Seed Script
 *
 * Seeds the database with sample data for:
 * - Kitchens and related mapping tables
 * - Admin users and roles
 * - Customers, customer favorites, and customer addresses
 * 
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

    // ── 8. Admin Users ─────────────────────────────────────────────
    // password_hash is bcrypt of 'admin123' - CHANGE IN PRODUCTION
    const adminPasswordHash = '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36zQvzsMv1Ri0Pg/DmhXrMC';

    const adminUsersResult = await pool.query(`
      INSERT INTO admin_users (name, email, phone, password_hash, is_active)
      VALUES
        ('Super Admin', 'superadmin@riwayat.com', '+966510000001', '${adminPasswordHash}', true),
        ('Operations Manager', 'ops@riwayat.com', '+966510000002', '${adminPasswordHash}', true),
        ('Support Agent', 'support@riwayat.com', '+966510000003', '${adminPasswordHash}', true)
      ON CONFLICT (email) DO NOTHING
      RETURNING id, name;
    `);

    const adminUsers = adminUsersResult.rows;
    if (adminUsers.length === 0) {
      logger.info('Admin users already seeded, fetching existing...');
      const existing = await pool.query(`SELECT id, name FROM admin_users WHERE email IN ('superadmin@riwayat.com', 'ops@riwayat.com', 'support@riwayat.com') ORDER BY email`);
      adminUsers.push(...existing.rows);
    }
    logger.info({ count: adminUsers.length }, 'Admin users seeded');

    // ── 9. Admin Roles ───────────────────────────────────────────
    const superAdminId = adminUsers.find(u => u.name === 'Super Admin')?.id || adminUsers[0]?.id;

    await pool.query(`
      INSERT INTO admin_roles (name, description, created_by, is_active)
      VALUES
        ('super_admin', 'Full platform access with all privileges', $1, true),
        ('operations_manager', 'Manage kitchens, orders, and platform operations', $1, true),
        ('support_agent', 'Handle customer and kitchen support tickets', $1, true)
      ON CONFLICT (name) DO NOTHING;
    `, [superAdminId]);

    const adminRolesResult = await pool.query(`SELECT id, name FROM admin_roles WHERE name IN ('super_admin', 'operations_manager', 'support_agent')`);
    const adminRoles = {};
    adminRolesResult.rows.forEach(r => { adminRoles[r.name] = r.id; });
    logger.info('Admin roles seeded');

    // ── 10. Admin User Roles (mapping) ───────────────────────────
    const adminUserRoleMappings = [
      { userName: 'Super Admin', roleName: 'super_admin' },
      { userName: 'Operations Manager', roleName: 'operations_manager' },
      { userName: 'Support Agent', roleName: 'support_agent' },
    ];

    for (const mapping of adminUserRoleMappings) {
      const user = adminUsers.find(u => u.name === mapping.userName);
      if (user && adminRoles[mapping.roleName]) {
        await pool.query(`
          INSERT INTO admin_user_roles (admin_user_id, role_id)
          VALUES ($1, $2)
          ON CONFLICT (admin_user_id, role_id) DO NOTHING
        `, [user.id, adminRoles[mapping.roleName]]);
      }
    }
    logger.info('Admin user roles seeded');

    // ── 11. Customers ────────────────────────────────────────────
    const customersData = [
      {
        customer_display_id: 'CUST-00001',
        name: 'Ali Ahmed',
        email: 'ali.ahmed@example.com',
        mobile: '+966500100001',
        gender: 'male',
        dob: '1990-05-15',
        type: 'basic',
        status: 'active',
        is_email_verified: true,
        is_mobile_verified: true,
      },
      {
        customer_display_id: 'CUST-00002',
        name: 'Sara Mohammed',
        email: 'sara.mohammed@example.com',
        mobile: '+966500100002',
        gender: 'female',
        dob: '1992-08-22',
        type: 'premium',
        status: 'active',
        is_email_verified: true,
        is_mobile_verified: true,
      },
      {
        customer_display_id: 'CUST-00003',
        name: 'Omar Hassan',
        email: 'omar.hassan@example.com',
        mobile: '+966500100003',
        gender: 'male',
        dob: '1988-12-10',
        type: 'basic',
        status: 'active',
        is_email_verified: false,
        is_mobile_verified: true,
      },
    ];

    const customerIds = [];
    for (const customer of customersData) {
      const res = await pool.query(`
        INSERT INTO customer (
          customer_display_id, name, email, mobile, gender, dob, type, status,
          is_email_verified, is_mobile_verified, last_login_at, created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW(), NOW())
        ON CONFLICT (customer_display_id) DO NOTHING
        RETURNING id, customer_display_id, name
      `, [
        customer.customer_display_id,
        customer.name,
        customer.email,
        customer.mobile,
        customer.gender,
        customer.dob,
        customer.type,
        customer.status,
        customer.is_email_verified,
        customer.is_mobile_verified,
      ]);

      if (res.rows.length > 0) {
        customerIds.push(res.rows[0].id);
      } else {
        const existing = await pool.query(
          `SELECT id FROM customer WHERE customer_display_id = $1`,
          [customer.customer_display_id]
        );
        if (existing.rows.length > 0) {
          customerIds.push(existing.rows[0].id);
        }
      }
    }
    logger.info({ count: customerIds.length }, 'Customers seeded');

    // ── 12. Customer Favorites (Kitchens) ────────────────────────
    // Assign each customer some favorite kitchens
    // Customer 1 favorites: Kitchen 1 and Kitchen 2
    // Customer 2 favorites: Kitchen 2 and Kitchen 3
    // Customer 3 favorites: Kitchen 1
    if (customerIds.length >= 3 && kitchens.length >= 3) {
      const favoriteMappings = [
        { customerIndex: 0, kitchenIndex: 0 }, // Ali -> Al Bayt Kitchen
        { customerIndex: 0, kitchenIndex: 1 }, // Ali -> Spice Route Kitchen
        { customerIndex: 1, kitchenIndex: 1 }, // Sara -> Spice Route Kitchen
        { customerIndex: 1, kitchenIndex: 2 }, // Sara -> Green Oasis Kitchen
        { customerIndex: 2, kitchenIndex: 0 }, // Omar -> Al Bayt Kitchen
      ];

      for (const mapping of favoriteMappings) {
        // Check if favorite already exists
        const existing = await pool.query(`
          SELECT id FROM customer_favorite
          WHERE customer_id = $1
            AND favorite_type = $2
            AND target_id = $3
        `, [
          customerIds[mapping.customerIndex],
          'kitchen',
          kitchens[mapping.kitchenIndex].id,
        ]);

        if (existing.rows.length === 0) {
          // Insert new favorite
          await pool.query(`
            INSERT INTO customer_favorite (
              customer_id, favorite_type, target_id, source, created_at
            )
            VALUES ($1, $2, $3, $4, NOW())
          `, [
            customerIds[mapping.customerIndex],
            'kitchen',
            kitchens[mapping.kitchenIndex].id,
            'user',
          ]);
        } else {
          // Reactivate if it was removed
          await pool.query(`
            UPDATE customer_favorite
            SET removed_at = NULL, source = $4
            WHERE customer_id = $1
              AND favorite_type = $2
              AND target_id = $3
          `, [
            customerIds[mapping.customerIndex],
            'kitchen',
            kitchens[mapping.kitchenIndex].id,
            'user',
          ]);
        }
      }
      logger.info({ count: favoriteMappings.length }, 'Customer favorites seeded');
    }

    // ── 13. Customer Addresses ───────────────────────────────────
    if (customerIds.length >= 3) {
      const addressesData = [
        {
          customerIndex: 0,
          label: 'Home',
          type: 'home',
          line1: '123 King Fahd Road',
          line2: 'Building 5, Apartment 12',
          area: 'Al Olaya',
          city: 'Riyadh',
          province: 'Riyadh',
          postal_code: '12211',
          country: 'Saudi Arabia',
          latitude: 24.7136,
          longitude: 46.6753,
          location_source: 'gps',
          contact_person_name: 'Ali Ahmed',
          contact_person_mobile: '+966500100001',
          is_primary: true,
          is_default_delivery: true,
          status: 'active',
        },
        {
          customerIndex: 0,
          label: 'Work',
          type: 'work',
          line1: '456 Business District',
          line2: 'Office Tower, Floor 10',
          area: 'Al Malaz',
          city: 'Riyadh',
          province: 'Riyadh',
          postal_code: '12643',
          country: 'Saudi Arabia',
          latitude: 24.6408,
          longitude: 46.7728,
          location_source: 'manual',
          contact_person_name: 'Ali Ahmed',
          contact_person_mobile: '+966500100001',
          is_primary: false,
          is_default_delivery: false,
          status: 'active',
        },
        {
          customerIndex: 1,
          label: 'Home',
          type: 'home',
          line1: '789 Al Nakheel Street',
          line2: 'Villa 15',
          area: 'Al Wurud',
          city: 'Riyadh',
          province: 'Riyadh',
          postal_code: '12284',
          country: 'Saudi Arabia',
          latitude: 24.6877,
          longitude: 46.7219,
          location_source: 'gps',
          contact_person_name: 'Sara Mohammed',
          contact_person_mobile: '+966500100002',
          is_primary: true,
          is_default_delivery: true,
          status: 'active',
        },
        {
          customerIndex: 2,
          label: 'Home',
          type: 'home',
          line1: '321 Prince Sultan Street',
          line2: 'Apartment 8',
          area: 'Al Malqa',
          city: 'Riyadh',
          province: 'Riyadh',
          postal_code: '13521',
          country: 'Saudi Arabia',
          latitude: 24.7584,
          longitude: 46.6394,
          location_source: 'gps',
          contact_person_name: 'Omar Hassan',
          contact_person_mobile: '+966500100003',
          is_primary: true,
          is_default_delivery: true,
          status: 'active',
        },
      ];

      for (const address of addressesData) {
        // Check if similar address already exists for this customer
        const existing = await pool.query(`
          SELECT id FROM customer_address
          WHERE customer_id = $1
            AND line1 = $2
            AND city = $3
            AND label = $4
        `, [
          customerIds[address.customerIndex],
          address.line1,
          address.city,
          address.label,
        ]);

        if (existing.rows.length === 0) {
          await pool.query(`
            INSERT INTO customer_address (
              customer_id, label, type, line1, line2, area, city, province,
              postal_code, country, latitude, longitude, location_source,
              contact_person_name, contact_person_mobile,
              is_primary, is_default_delivery, status, created_at, updated_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, NOW(), NOW())
          `, [
            customerIds[address.customerIndex],
            address.label,
            address.type,
            address.line1,
            address.line2,
            address.area,
            address.city,
            address.province,
            address.postal_code,
            address.country,
            address.latitude,
            address.longitude,
            address.location_source,
            address.contact_person_name,
            address.contact_person_mobile,
            address.is_primary,
            address.is_default_delivery,
            address.status,
          ]);
        }
      }
      logger.info({ count: addressesData.length }, 'Customer addresses seeded');
    }

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
    console.log('  ──────────────────────────────────────');
    console.log('  admin_users:              3 entries');
    console.log('  admin_roles:              3 entries');
    console.log('  admin_user_roles:         3 entries');
    console.log('  ──────────────────────────────────────');
    console.log('  customers:               3 entries');
    console.log('  customer_favorites:      5 entries');
    console.log('  customer_addresses:      4 entries');
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
