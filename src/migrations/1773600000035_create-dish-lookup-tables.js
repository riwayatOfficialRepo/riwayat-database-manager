/**
 * Migration: Create dish_tags, dish_cuisines, dish_dietary_flags lookup tables
 * and seed all dish lookup tables
 */

exports.up = (pgm) => {
  // ── dish_tags ─────────────────────────────────────────────────
  pgm.createTable('dish_tags', {
    id: { type: 'serial', primaryKey: true },
    name: { type: 'text', notNull: true },
    label_key: { type: 'text' },
    status: { type: 'varchar(20)', default: "'ACTIVE'" },
    created_at: { type: 'timestamp', default: pgm.func('now()') },
  }, { ifNotExists: true });

  pgm.sql(`CREATE UNIQUE INDEX IF NOT EXISTS dish_tags_name_key ON dish_tags (name)`);

  // ── dish_cuisines ─────────────────────────────────────────────
  pgm.createTable('dish_cuisines', {
    id: { type: 'serial', primaryKey: true },
    name: { type: 'text', notNull: true },
    label_key: { type: 'text' },
    status: { type: 'varchar(20)', default: "'ACTIVE'" },
    created_at: { type: 'timestamp', default: pgm.func('now()') },
  }, { ifNotExists: true });

  pgm.sql(`CREATE UNIQUE INDEX IF NOT EXISTS dish_cuisines_name_key ON dish_cuisines (name)`);

  // ── dish_dietary_flags ────────────────────────────────────────
  pgm.createTable('dish_dietary_flags', {
    id: { type: 'serial', primaryKey: true },
    name: { type: 'text', notNull: true },
    label_key: { type: 'text' },
    status: { type: 'varchar(20)', default: "'ACTIVE'" },
    created_at: { type: 'timestamp', default: pgm.func('now()') },
  }, { ifNotExists: true });

  pgm.sql(`CREATE UNIQUE INDEX IF NOT EXISTS dish_dietary_flags_name_key ON dish_dietary_flags (name)`);

  // ── SEED: dish_categories ────────────────────────────────────
  pgm.sql(`
    INSERT INTO dish_categories (name, description, label_key, status) VALUES
      ('Appetizers',  'Starters and light bites',                    'category.appetizers',  'ACTIVE'),
      ('Main Course', 'Primary dishes of a meal',                    'category.main_course', 'ACTIVE'),
      ('Desserts',    'Sweet dishes served at end of meal',          'category.desserts',    'ACTIVE'),
      ('Beverages',   'Drinks, juices, and hot drinks',              'category.beverages',   'ACTIVE'),
      ('Soups',       'Hot and cold soups',                          'category.soups',       'ACTIVE'),
      ('Salads',      'Fresh vegetable and grain salads',            'category.salads',      'ACTIVE'),
      ('Breads',      'Freshly baked breads and flatbreads',         'category.breads',      'ACTIVE'),
      ('Snacks',      'Light bites and finger foods',                'category.snacks',      'ACTIVE'),
      ('Breakfast',   'Morning meals and breakfast dishes',          'category.breakfast',   'ACTIVE'),
      ('Side Dishes', 'Accompaniments served alongside main dishes', 'category.side_dishes', 'ACTIVE')
    ON CONFLICT (name) DO NOTHING;
  `);

  // ── SEED: dish_course_types ──────────────────────────────────
  pgm.sql(`
    INSERT INTO dish_course_types (name, label_key, status) VALUES
      ('Starter',   'course_type.starter',   'ACTIVE'),
      ('Main',      'course_type.main',      'ACTIVE'),
      ('Dessert',   'course_type.dessert',   'ACTIVE'),
      ('Beverage',  'course_type.beverage',  'ACTIVE'),
      ('Side',      'course_type.side',      'ACTIVE'),
      ('Breakfast', 'course_type.breakfast', 'ACTIVE'),
      ('Snack',     'course_type.snack',     'ACTIVE')
    ON CONFLICT (name) DO NOTHING;
  `);

  // ── SEED: dish_tags ──────────────────────────────────────────
  pgm.sql(`
    INSERT INTO dish_tags (name, label_key, status) VALUES
      ('Spicy',          'tag.spicy',          'ACTIVE'),
      ('Sweet',          'tag.sweet',          'ACTIVE'),
      ('Savory',         'tag.savory',         'ACTIVE'),
      ('Mild',           'tag.mild',           'ACTIVE'),
      ('Grilled',        'tag.grilled',        'ACTIVE'),
      ('Fried',          'tag.fried',          'ACTIVE'),
      ('Baked',          'tag.baked',          'ACTIVE'),
      ('Steamed',        'tag.steamed',        'ACTIVE'),
      ('Traditional',    'tag.traditional',    'ACTIVE'),
      ('Fusion',         'tag.fusion',         'ACTIVE'),
      ('Street Food',    'tag.street_food',    'ACTIVE'),
      ('Family Recipe',  'tag.family_recipe',  'ACTIVE'),
      ('Signature Dish', 'tag.signature_dish', 'ACTIVE'),
      ('Comfort Food',   'tag.comfort_food',   'ACTIVE'),
      ('Quick Meal',     'tag.quick_meal',     'ACTIVE'),
      ('Healthy',        'tag.healthy',        'ACTIVE'),
      ('Rich',           'tag.rich',           'ACTIVE'),
      ('Light',          'tag.light',          'ACTIVE')
    ON CONFLICT (name) DO NOTHING;
  `);

  // ── SEED: dish_cuisines ──────────────────────────────────────
  pgm.sql(`
    INSERT INTO dish_cuisines (name, label_key, status) VALUES
      ('Arabic',        'cuisine.arabic',        'ACTIVE'),
      ('Pakistani',     'cuisine.pakistani',     'ACTIVE'),
      ('Indian',        'cuisine.indian',        'ACTIVE'),
      ('Lebanese',      'cuisine.lebanese',      'ACTIVE'),
      ('Turkish',       'cuisine.turkish',       'ACTIVE'),
      ('Persian',       'cuisine.persian',       'ACTIVE'),
      ('Mediterranean', 'cuisine.mediterranean', 'ACTIVE'),
      ('Egyptian',      'cuisine.egyptian',      'ACTIVE'),
      ('Moroccan',      'cuisine.moroccan',      'ACTIVE'),
      ('Italian',       'cuisine.italian',       'ACTIVE'),
      ('Chinese',       'cuisine.chinese',       'ACTIVE'),
      ('Japanese',      'cuisine.japanese',      'ACTIVE'),
      ('Mexican',       'cuisine.mexican',       'ACTIVE'),
      ('American',      'cuisine.american',      'ACTIVE'),
      ('French',        'cuisine.french',        'ACTIVE')
    ON CONFLICT (name) DO NOTHING;
  `);

  // ── SEED: dish_dietary_flags ─────────────────────────────────
  pgm.sql(`
    INSERT INTO dish_dietary_flags (name, label_key, status) VALUES
      ('Halal',        'dietary.halal',        'ACTIVE'),
      ('Vegetarian',   'dietary.vegetarian',   'ACTIVE'),
      ('Vegan',        'dietary.vegan',        'ACTIVE'),
      ('Gluten-Free',  'dietary.gluten_free',  'ACTIVE'),
      ('Dairy-Free',   'dietary.dairy_free',   'ACTIVE'),
      ('Nut-Free',     'dietary.nut_free',     'ACTIVE'),
      ('Low-Carb',     'dietary.low_carb',     'ACTIVE'),
      ('High-Protein', 'dietary.high_protein', 'ACTIVE'),
      ('Sugar-Free',   'dietary.sugar_free',   'ACTIVE'),
      ('Egg-Free',     'dietary.egg_free',     'ACTIVE')
    ON CONFLICT (name) DO NOTHING;
  `);
};

exports.down = (pgm) => {
  pgm.dropTable('dish_dietary_flags', { ifExists: true, cascade: true });
  pgm.dropTable('dish_cuisines', { ifExists: true, cascade: true });
  pgm.dropTable('dish_tags', { ifExists: true, cascade: true });
};
