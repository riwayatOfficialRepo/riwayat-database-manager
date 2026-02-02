const { Pool } = require('pg');
const path = require('path');
const logger = require('./logger');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });

// Hybrid Database configuration
const dbConfig = process.env.POSTGRES_URL
  ? {
      connectionString: process.env.POSTGRES_URL,
      ssl: { rejectUnauthorized: false },
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    }
  : {
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432', 10),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    };

// Create a new pool instance
const pool = new Pool(dbConfig);

// Connection monitoring
class ConnectionMonitor {
  constructor() {
    this.totalConnections = 0;
    this.activeConnections = 0;
    this.idleConnections = 0;
    this.waitingClients = 0;
    this.connectionStats = {
      acquired: 0,
      released: 0,
      created: 0,
      removed: 0,
    };
  }

  updateStats() {
    this.totalConnections = pool.totalCount;
    this.idleConnections = pool.idleCount;
    this.activeConnections = pool.totalCount - pool.idleCount;
    this.waitingClients = pool.waitingCount;
  }

  getStats() {
    this.updateStats();
    return {
      total: this.totalConnections,
      active: this.activeConnections,
      idle: this.idleConnections,
      waiting: this.waitingClients,
      max: pool.options.max || 20,
      usage: `${this.activeConnections}/${pool.options.max || 20}`,
      stats: this.connectionStats,
    };
  }

  logStats() {
    const stats = this.getStats();
    console.log('📊 Database Connection Stats:', {
      active: `${stats.active}/${stats.max}`,
      idle: stats.idle,
      waiting: stats.waiting,
      usage: `${((stats.active / stats.max) * 100).toFixed(1)}%`,
    });
  }

  incrementAcquired() {
    this.connectionStats.acquired++;
  }

  incrementReleased() {
    this.connectionStats.released++;
  }

  incrementCreated() {
    this.connectionStats.created++;
  }

  incrementRemoved() {
    this.connectionStats.removed++;
  }
}

// Initialize monitor
const monitor = new ConnectionMonitor();

// Instrument the pool to track connections
const originalQuery = pool.query.bind(pool);
pool.query = function (queryTextOrConfig, values) {
  monitor.incrementAcquired();
  monitor.updateStats();

  const startTime = Date.now();
  return originalQuery(queryTextOrConfig, values)
    .then((result) => {
      monitor.incrementReleased();
      monitor.updateStats();

      const duration = Date.now() - startTime;
      if (duration > 1000) {
        // Log slow queries
        const queryText = typeof queryTextOrConfig === 'string'
          ? queryTextOrConfig
          : queryTextOrConfig.text || '';
        console.warn(`⚠️ Slow query detected: ${duration}ms`, {
          query: queryText.substring(0, 100) + '...',
        });
      }

      return result;
    })
    .catch((error) => {
      monitor.incrementReleased();
      monitor.updateStats();
      throw error;
    });
};

// Track connection lifecycle
pool.on('connect', () => {
  monitor.incrementCreated();
  monitor.updateStats();
  console.log('🔗 New database connection created');
});

pool.on('acquire', () => {
  monitor.incrementAcquired();
  monitor.updateStats();
});

pool.on('release', () => {
  monitor.incrementReleased();
  monitor.updateStats();
});

pool.on('remove', () => {
  monitor.incrementRemoved();
  monitor.updateStats();
  console.log('🗑️ Database connection removed');
});

// Test database connection
const connectDB = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ PostgreSQL database connected successfully');

    const result = await client.query('SELECT NOW()');
    console.log('🕒 Database time:', result.rows[0].now);

    // Log initial stats
    monitor.logStats();

    client.release();
    return pool;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Database connection failed:', errorMessage);
    throw error;
  }
};

// Handle pool errors
pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err);
  monitor.updateStats();
});

// Export monitoring functions
const getConnectionStats = () => monitor.getStats();
const logConnectionStats = () => monitor.logStats();

// Auto-log stats every 30 seconds (optional)
if (process.env.NODE_ENV === 'development') {
  setInterval(() => {
    monitor.logStats();
  }, 30000);
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🛑 Shutting down database pool...');

  // Log final stats
  const finalStats = monitor.getStats();
  console.log('📊 Final connection stats:', finalStats);

  await pool.end();
  console.log('✅ Database pool closed');
  process.exit(0);
});

// Health check endpoint helper
const healthCheck = async () => {
  try {
    const stats = monitor.getStats();
    await pool.query('SELECT 1 as health_check');

    return {
      status: 'healthy',
      database: 'connected',
      connections: stats,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      status: 'unhealthy',
      database: 'disconnected',
      error: errorMessage,
      timestamp: new Date().toISOString(),
    };
  }
};

// Execute a single query with logging
const executeQuery = async (sql, params = [], client = null) => {
  const db = client || pool;
  try {
    logger.debug({ sql, params }, 'Executing SQL');
    const { rows } = await db.query(sql, params);
    return rows;
  } catch (error) {
    logger.error({ error, sql, params }, 'Database error');
    throw error;
  }
};

// Execute operation within a database transaction
const executeTransaction = async (operation, context = {}, log = logger, operationName = 'Transaction', moduleName = 'TransactionHelper') => {
  const client = await pool.connect();

  try {
    log.info(context, `[${moduleName}] ${operationName} - START`);
    await client.query('BEGIN');

    const result = await operation(client);

    await client.query('COMMIT');
    log.info(context, `[${moduleName}] ${operationName} - COMPLETE`);
    return result;

  } catch (error) {
    const safeError = {
      message: error.message,
      stack: error.stack,
      ...error,
    };

    log.error({ ...context, error: safeError }, `[${moduleName}] ${operationName} - ERROR`);

    try {
      await client.query('ROLLBACK');
      log.info(context, `[${moduleName}] ${operationName} - ROLLBACK COMPLETE`);
    } catch (rollbackErr) {
      log.error({ rollbackErr }, `[${moduleName}] Rollback failed`);
    }

    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  connectDB,
  pool,
  query: pool.query.bind(pool),
  executeQuery,
  executeTransaction,
  getConnectionStats,
  logConnectionStats,
  healthCheck,
};
