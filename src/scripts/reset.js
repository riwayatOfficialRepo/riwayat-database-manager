/**
 * Migration Reset Script
 *
 * Clears migration history and optionally drops all database objects (tables, ENUMs, sequences, etc.).
 * WARNING: This will delete all data if dropTables is true!
 *
 * Usage:
 *   npm run migrate:reset          - Clear migration history only, keep tables
 *   npm run migrate:reset -- --drop - Clear migration history AND drop all database objects
 */

const { pool, connectDB } = require('../database');
const logger = require('../logger');
const { execSync } = require('child_process');
const path = require('path');

const DROP_TABLES = process.argv.includes('--drop');

async function clearMigrationsTable() {
  logger.info('Clearing migration history...');
  await pool.query('TRUNCATE TABLE pgmigrations');
  logger.info('Migration history cleared');
}

async function dropAllEnums() {
  logger.warn('Dropping all ENUM types...');
  
  // Get all custom ENUM types (exclude system types)
  const result = await pool.query(`
    SELECT typname 
    FROM pg_type 
    WHERE typtype = 'e'
    AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    ORDER BY typname
  `);
  
  const enums = result.rows.map(row => row.typname);
  
  if (enums.length === 0) {
    logger.info('No ENUM types to drop');
    return;
  }
  
  // Drop ENUMs (CASCADE handles dependencies)
  for (const enumName of enums) {
    try {
      await pool.query(`DROP TYPE IF EXISTS ${enumName} CASCADE`);
      logger.info({ enum: enumName }, 'Dropped ENUM type');
    } catch (error) {
      logger.error({ enum: enumName, error: error.message }, 'Failed to drop ENUM type');
    }
  }
  
  logger.info({ count: enums.length }, 'All ENUM types dropped');
}

async function dropAllSequences() {
  logger.warn('Dropping all sequences...');
  
  // Get all sequences (excluding system sequences)
  const result = await pool.query(`
    SELECT sequencename 
    FROM pg_sequences 
    WHERE schemaname = 'public'
    AND sequencename NOT LIKE 'pgmigrations%'
    ORDER BY sequencename
  `);
  
  const sequences = result.rows.map(row => row.sequencename);
  
  if (sequences.length === 0) {
    logger.info('No sequences to drop');
    return;
  }
  
  // Drop sequences
  for (const sequence of sequences) {
    try {
      await pool.query(`DROP SEQUENCE IF EXISTS ${sequence} CASCADE`);
      logger.info({ sequence }, 'Dropped sequence');
    } catch (error) {
      logger.error({ sequence, error: error.message }, 'Failed to drop sequence');
    }
  }
  
  logger.info({ count: sequences.length }, 'All sequences dropped');
}

async function dropAllViews() {
  logger.warn('Dropping all views...');
  
  // Get all views
  const result = await pool.query(`
    SELECT table_name 
    FROM information_schema.views 
    WHERE table_schema = 'public'
    ORDER BY table_name
  `);
  
  const views = result.rows.map(row => row.table_name);
  
  if (views.length === 0) {
    logger.info('No views to drop');
    return;
  }
  
  // Drop views
  for (const view of views) {
    try {
      await pool.query(`DROP VIEW IF EXISTS ${view} CASCADE`);
      logger.info({ view }, 'Dropped view');
    } catch (error) {
      logger.error({ view, error: error.message }, 'Failed to drop view');
    }
  }
  
  logger.info({ count: views.length }, 'All views dropped');
}

async function dropAllTables() {
  logger.warn('Dropping all tables...');
  
  // Get all table names
  const result = await pool.query(`
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public'
    AND tablename != 'pgmigrations'
    ORDER BY tablename
  `);
  
  const tables = result.rows.map(row => row.tablename);
  
  if (tables.length === 0) {
    logger.info('No tables to drop');
    return;
  }
  
  // Drop tables with CASCADE to handle foreign keys
  for (const table of tables) {
    try {
      await pool.query(`DROP TABLE IF EXISTS ${table} CASCADE`);
      logger.info({ table }, 'Dropped table');
    } catch (error) {
      logger.error({ table, error: error.message }, 'Failed to drop table');
    }
  }
  
  logger.info({ count: tables.length }, 'All tables dropped');
}

async function dropAllDatabaseObjects() {
  logger.info('Dropping all database objects...');
  
  // Drop in order: views -> tables -> sequences -> enums
  // (Some objects depend on others, so order matters)
  await dropAllViews();
  await dropAllTables();
  await dropAllSequences();
  await dropAllEnums();
  
  logger.info('All database objects dropped');
}

async function ensureMigrationsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS pgmigrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      run_on TIMESTAMP NOT NULL
    )
  `);
}

async function reset() {
  try {
    await connectDB();
    logger.info('Starting migration reset...');
    
    // Ensure pgmigrations table exists
    await ensureMigrationsTable();
    
    if (DROP_TABLES) {
      console.log('\n⚠️  WARNING: This will DROP ALL DATABASE OBJECTS and DELETE ALL DATA!');
      console.log('This includes:');
      console.log('  - All tables');
      console.log('  - All ENUM types');
      console.log('  - All sequences');
      console.log('  - All views');
      console.log('\nPress Ctrl+C within 5 seconds to cancel...\n');
      
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      await dropAllDatabaseObjects();
    } else {
      console.log('\nℹ️  Clearing migration history only (database objects will be preserved)');
      console.log('Use --drop flag to also drop all tables, ENUMs, sequences, and views\n');
    }
    
    await clearMigrationsTable();
    
    console.log('\n========================================');
    console.log('  RESET COMPLETE');
    console.log('========================================');
    console.log(`  Database objects dropped: ${DROP_TABLES ? 'Yes (tables, ENUMs, sequences, views)' : 'No'}`);
    console.log('  Migration history: Cleared');
    console.log('========================================');
    console.log('\nRun "npm run migrate" to apply all migrations.\n');
    
    process.exit(0);
  } catch (error) {
    logger.error({ error }, 'Reset failed');
    console.error('Reset failed:', error.message);
    process.exit(1);
  }
}

reset();
