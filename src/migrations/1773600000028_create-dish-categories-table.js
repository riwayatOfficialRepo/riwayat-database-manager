/**
 * Migration: Create dish_categories table
 * Must run before dishes (030) and dishes_staging (031) which FK to this table
 */

exports.up = (pgm) => {
  pgm.createTable('dish_categories', {
    id: { type: 'serial', primaryKey: true },
    name: { type: 'varchar(50)', notNull: true },
    description: { type: 'text' },
    label_key: { type: 'text' },
    status: { type: 'varchar(20)', default: "'ACTIVE'" },
    created_at: { type: 'timestamp', default: pgm.func('now()') },
    deletedat: { type: 'timestamp' },
  }, { ifNotExists: true });

  pgm.sql(`CREATE UNIQUE INDEX IF NOT EXISTS dish_categories_name_key ON dish_categories (name)`);
};

exports.down = (pgm) => {
  pgm.dropTable('dish_categories', { ifExists: true, cascade: true });
};
