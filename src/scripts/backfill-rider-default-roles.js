/**
 * Assign default "Rider" role to every rider missing rider_user_roles (idempotent).
 *
 * Prerequisites: migrations 1775500000000 (rider RBAC tables) and
 * 1775500000001 (seed role + permissions) have been applied.
 *
 * Usage (from riwayat-database-manager, with DATABASE_URL or .env):
 *   npm run backfill:rider-roles
 */

require("dotenv").config({ path: require("path").resolve(process.cwd(), ".env") });

const { pool, connectDB } = require("../database");
const logger = require("../logger");

async function main() {
  await connectDB();

  const insert = await pool.query(`
    INSERT INTO rider_user_roles (rider_id, role_id, status)
    SELECT rd.rider_id, r.id, 'ACTIVE'
    FROM riders rd
    CROSS JOIN rider_roles r
    WHERE r.name = 'Rider' AND r.status = 'ACTIVE'
      AND NOT EXISTS (
        SELECT 1 FROM rider_user_roles ur
        WHERE ur.rider_id = rd.rider_id AND ur.role_id = r.id
      )
    RETURNING rider_id;
  `);

  logger.info(
    { insertedCount: insert.rowCount },
    "[backfill-rider-default-roles] Assigned default Rider role where missing",
  );

  await pool.end();
}

main().catch((err) => {
  logger.error({ err }, "[backfill-rider-default-roles] Failed");
  process.exit(1);
});
