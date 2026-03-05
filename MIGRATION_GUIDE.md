# Database Migration Guide

This guide explains how to use the migration and seeding scripts in `riwayat-database-manager`.

## Available Scripts

### Migration Commands

#### 1. **Run Migrations**
```bash
npm run migrate
```
Applies all pending migrations in order. Use this after pulling new migrations or when setting up a fresh database.

#### 2. **Check Migration Status**
```bash
npm run migrate:status
```
Shows which migrations have been run and which are pending.

#### 3. **Reset Migrations** ⚠️
```bash
# Clear migration history only (keeps tables, ENUMs, sequences, views, and data)
npm run migrate:reset

# Clear migration history AND drop all database objects (deletes everything!)
npm run migrate:reset -- --drop
```

**Use Cases:**
- **Without `--drop`**: When you want to re-run all migrations from scratch but keep existing data (useful for fixing migration ordering issues)
- **With `--drop`**: When you want a completely fresh start (development only!)

**⚠️ WARNING**: The `--drop` flag will delete:
- ALL tables
- ALL ENUM types (e.g., `chat_type`, `chat_room_status`, etc.)
- ALL sequences
- ALL views
- ALL data

Use with extreme caution! This is for development only!

#### 4. **Baseline Existing Database**
```bash
npm run migrate:baseline
```
Marks migrations as "done" for tables that already exist. Useful when you have an existing database with tables but no migration history.

**How it works:**
- Checks which tables exist in the database
- Marks corresponding migrations as "run" in `pgmigrations` table
- Tables that don't exist will be created when you run `npm run migrate`

#### 5. **Rollback Last Migration**
```bash
npm run migrate:down
```
Rolls back the last migration that was run.

#### 6. **Redo Last Migration**
```bash
npm run migrate:redo
```
Rolls back and re-runs the last migration.

#### 7. **Create New Migration**
```bash
npm run migrate:create <migration-name>
```
Creates a new migration file. Example:
```bash
npm run migrate:create add-user-email-index
```

### Seeding Commands

#### **Seed Database**
```bash
npm run seed
```
Populates the database with sample data:
- 3 sample kitchens
- Kitchen roles and permissions
- Kitchen users
- Admin users and roles
- All related mappings

**Note**: Uses `ON CONFLICT DO NOTHING`, so it's safe to run multiple times.

## Common Workflows

### Fresh Database Setup
```bash
# 1. Run all migrations
npm run migrate

# 2. Seed with sample data
npm run seed
```

### Fix Migration Ordering Issues
```bash
# 1. Clear migration history (keeps tables)
npm run migrate:reset

# 2. Re-run all migrations
npm run migrate
```

### Complete Fresh Start (Development)
```bash
# 1. Drop everything (tables, ENUMs, sequences, views) and reset
npm run migrate:reset -- --drop

# 2. Run all migrations (will recreate all objects)
npm run migrate

# 3. Seed with sample data
npm run seed
```

### Existing Database (No Migration History)
```bash
# 1. Baseline existing tables
npm run migrate:baseline

# 2. Run remaining migrations
npm run migrate

# 3. Seed with sample data (optional)
npm run seed
```

## Script Details

### `src/scripts/reset.js`
- Clears the `pgmigrations` table
- Optionally drops all database objects (with `--drop` flag):
  - All tables
  - All ENUM types (e.g., `chat_type`, `chat_room_status`)
  - All sequences
  - All views
- Provides a 5-second warning before dropping objects
- Drops objects in correct order to handle dependencies

### `src/scripts/baseline.js`
- Checks which tables exist
- Marks corresponding migrations as "run"
- Only handles migrations 1-14 (kitchen-related tables)
- Can be extended to include more migrations

### `src/scripts/seed.js`
- Seeds kitchens, roles, permissions, users
- Seeds admin users and roles
- Uses conflict handling to prevent duplicates
- Safe to run multiple times

## Troubleshooting

### Error: "Not run migration X is preceding already run migration Y"
This means there's a migration ordering conflict. Solutions:
1. **Reset and re-run** (recommended):
   ```bash
   npm run migrate:reset
   npm run migrate
   ```
2. **Manually fix**: Renumber the conflicting migration file to a higher number

### Error: "Migration already run"
The migration is already recorded in `pgmigrations`. To re-run:
```bash
npm run migrate:reset  # Clear history
npm run migrate        # Re-run all
```

### Tables exist but migrations show as pending
Use baseline:
```bash
npm run migrate:baseline
npm run migrate
```

## Migration Table Structure

The `pgmigrations` table tracks which migrations have been run:
- `id`: Auto-incrementing ID
- `name`: Migration filename (e.g., `1737000000001_create-kitchens-table`)
- `run_on`: Timestamp when migration was run

## Best Practices

1. **Always check status** before running migrations:
   ```bash
   npm run migrate:status
   ```

2. **Backup before reset** if you have important data:
   ```bash
   pg_dump your_database > backup.sql
   ```

3. **Use baseline** for existing databases instead of reset

4. **Test migrations** in development before applying to production

5. **Never drop tables** in production without a backup!
