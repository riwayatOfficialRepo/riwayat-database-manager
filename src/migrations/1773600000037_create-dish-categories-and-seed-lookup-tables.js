/**
 * Migration: Add missing FKs to dishes & dishes_staging (safety, in case they were skipped),
 * and seed dish_categories + dish_course_types lookup tables
 */

exports.up = (pgm) => {
  // ── Add FK: dishes.dish_category_id -> dish_categories ───────
  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE dishes ADD CONSTRAINT dishes_dish_category_id_fkey
        FOREIGN KEY (dish_category_id) REFERENCES dish_categories(id)
        ON UPDATE NO ACTION ON DELETE NO ACTION;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  // ── Add FK: dishes_staging.dish_category_id -> dish_categories
  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE dishes_staging ADD CONSTRAINT dishes_staging_dish_category_id_fkey
        FOREIGN KEY (dish_category_id) REFERENCES dish_categories(id)
        ON UPDATE NO ACTION ON DELETE NO ACTION;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

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
};

exports.down = (pgm) => {
  pgm.sql(`ALTER TABLE dishes_staging DROP CONSTRAINT IF EXISTS dishes_staging_dish_category_id_fkey`);
  pgm.sql(`ALTER TABLE dishes DROP CONSTRAINT IF EXISTS dishes_dish_category_id_fkey`);
};
