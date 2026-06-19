require("dotenv").config();
const { pool, connectDB } = require("../database");

(async () => {
  await connectDB();
  const result = await pool.query(`
    SELECT name, run_on
    FROM pgmigrations
    ORDER BY run_on DESC
    LIMIT 30
  `);
  console.table(result.rows);
  await pool.end();
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
