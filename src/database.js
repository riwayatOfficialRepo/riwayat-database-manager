const { Pool } = require("pg");
const path = require("path");
const logger = require("./logger");
require("dotenv").config({ path: path.resolve(process.cwd(), ".env") });

function resolvePgSsl(connectionString) {
  const explicitOff =
    process.env.DATABASE_SSL === "false" ||
    process.env.DATABASE_SSL === "0" ||
    process.env.DB_SSL === "false" ||
    process.env.DB_SSL === "0" ||
    process.env.PGSSLMODE === "disable";

  if (explicitOff) return false;

  const explicitOn =
    process.env.DATABASE_SSL === "true" ||
    process.env.DATABASE_SSL === "1" ||
    process.env.DB_SSL === "true" ||
    process.env.DB_SSL === "1";

  if (explicitOn) return { rejectUnauthorized: false };

  if (!connectionString) return false;

  try {
    const host = new URL(connectionString).hostname;
    if (host === "localhost" || host === "127.0.0.1" || host === "::1") {
      return false;
    }
  } catch {
    /* fall through */
  }

  // All remote hosts (AWS RDS, Aurora, RDS Proxy) require SSL
  return { rejectUnauthorized: false };
}

// RDS Proxy endpoints look like: *.proxy-<id>.<region>.rds.amazonaws.com
// The proxy handles server-side pooling, so app-side pool settings can differ.
function isRdsProxy(cs) {
  try {
    const host = new URL(cs).hostname;
    return host.includes(".proxy-") && host.endsWith(".rds.amazonaws.com");
  } catch {
    return false;
  }
}

const connectionString =
  process.env.POSTGRES_URL || process.env.DATABASE_URL || "";

const usingRdsProxy = Boolean(connectionString && isRdsProxy(connectionString));

const MAX_POOL = parseInt(process.env.DB_POOL_MAX || "20", 10);
const MIN_POOL = parseInt(process.env.DB_POOL_MIN || "2", 10);
const IDLE_TIMEOUT_MS = parseInt(process.env.DB_IDLE_TIMEOUT_MS || "30000", 10);
const CONN_TIMEOUT_MS = parseInt(process.env.DB_CONN_TIMEOUT_MS || "10000", 10);
// Threshold below which queries are not logged as slow
const SLOW_QUERY_MS = parseInt(process.env.DB_SLOW_QUERY_MS || "500", 10);

const baseConfig = {
  min: MIN_POOL,
  max: MAX_POOL,
  idleTimeoutMillis: IDLE_TIMEOUT_MS,
  connectionTimeoutMillis: CONN_TIMEOUT_MS,
  // TCP keepalive prevents AWS NAT gateway from silently dropping idle connections
  // (AWS kills connections idle for ~350 s without keepalives).
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
};

const dbConfig = connectionString
  ? {
      connectionString,
      ssl: resolvePgSsl(connectionString),
      ...baseConfig,
    }
  : {
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || "5432", 10),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl: resolvePgSsl(""),
      ...baseConfig,
    };

const pool = new Pool(dbConfig);

// --- Monitoring ---

const _stats = {
  connections: { created: 0, removed: 0 },
  queries: { executed: 0, slow: 0, errors: 0 },
};

function getPoolStats() {
  const active = pool.totalCount - pool.idleCount;
  return {
    total: pool.totalCount,
    active,
    idle: pool.idleCount,
    waiting: pool.waitingCount,
    max: MAX_POOL,
    usage: `${active}/${MAX_POOL}`,
    lifetime: _stats,
  };
}

pool.on("connect", () => {
  _stats.connections.created++;
});

pool.on("remove", () => {
  _stats.connections.removed++;
});

pool.on("error", (err) => {
  logger.error({ err }, "Unexpected error on idle DB client");
});

// Wrap pool.query for slow-query detection only.
// Do NOT track acquire/release here — pool events handle that without double-counting.
const _query = pool.query.bind(pool);
pool.query = function (queryTextOrConfig, values) {
  const t0 = Date.now();
  _stats.queries.executed++;

  return _query(queryTextOrConfig, values)
    .then((result) => {
      const ms = Date.now() - t0;
      if (ms > SLOW_QUERY_MS) {
        _stats.queries.slow++;
        const text =
          typeof queryTextOrConfig === "string"
            ? queryTextOrConfig
            : queryTextOrConfig.text || "";
        logger.warn({ ms, query: text.slice(0, 120) }, "Slow query");
      }
      return result;
    })
    .catch((err) => {
      _stats.queries.errors++;
      throw err;
    });
};

// --- Public API ---

const connectDB = async () => {
  try {
    const client = await pool.connect();
    const { rows } = await client.query("SELECT NOW()");
    client.release();
    logger.info(
      { dbTime: rows[0].now, pool: getPoolStats(), usingRdsProxy },
      "PostgreSQL connected",
    );
    return pool;
  } catch (error) {
    logger.warn({ error: error.message }, "Pre-connection failed, will connect on-demand");
    return null;
  }
};

const healthCheck = async () => {
  try {
    await pool.query("SELECT 1");
    return {
      status: "healthy",
      database: "connected",
      connections: getPoolStats(),
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: "unhealthy",
      database: "disconnected",
      error: error.message,
      timestamp: new Date().toISOString(),
    };
  }
};

const executeQuery = async (sql, params = [], client = null) => {
  const db = client || pool;
  try {
    logger.debug({ sql, params }, "Executing SQL");
    const { rows } = await db.query(sql, params);
    return rows;
  } catch (error) {
    logger.error({ error, sql, params }, "Database error");
    throw error;
  }
};

const executeTransaction = async (
  operation,
  context = {},
  log = logger,
  operationName = "Transaction",
  moduleName = "TransactionHelper",
) => {
  const client = await pool.connect();
  try {
    log.info(context, `[${moduleName}] ${operationName} - START`);
    await client.query("BEGIN");
    const result = await operation(client);
    await client.query("COMMIT");
    log.info(context, `[${moduleName}] ${operationName} - COMPLETE`);
    return result;
  } catch (error) {
    log.error(
      { ...context, error: { message: error.message, stack: error.stack } },
      `[${moduleName}] ${operationName} - ERROR`,
    );
    try {
      await client.query("ROLLBACK");
      log.info(context, `[${moduleName}] ${operationName} - ROLLBACK COMPLETE`);
    } catch (rollbackErr) {
      log.error({ rollbackErr }, `[${moduleName}] Rollback failed`);
    }
    throw error;
  } finally {
    client.release();
  }
};

// Graceful shutdown — SIGTERM is sent by AWS ECS/EC2/Fargate stop events;
// SIGINT is sent by Ctrl-C in local/dev environments.
async function shutdown(signal) {
  logger.info({ signal, pool: getPoolStats() }, "Shutting down DB pool");
  await pool.end();
  logger.info("DB pool closed");
  process.exit(0);
}
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

if (process.env.NODE_ENV === "development") {
  setInterval(() => logger.info(getPoolStats(), "DB pool stats"), 30000).unref();
}

module.exports = {
  pool,
  connectDB,
  healthCheck,
  executeQuery,
  executeTransaction,
  getPoolStats,
  query: pool.query.bind(pool),
};
