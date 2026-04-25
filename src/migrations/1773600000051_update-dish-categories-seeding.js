/**
 * Migration: Update dish_categories to correct values (safe, no truncate)
 */

exports.up = (pgm) => {
  pgm.sql(`
    INSERT INTO dish_categories (name, label_key, status) VALUES
      ('Home Catering', 'category.home_catering', 'ACTIVE'),
      ('Side On',       'category.side_on',        'ACTIVE'),
      ('Special Event', 'category.special_event',  'ACTIVE'),
      ('Custom',        'category.custom',          'ACTIVE'),
      ('Readily',       'category.readily',         'ACTIVE')
    ON CONFLICT (name) DO NOTHING;
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    DELETE FROM dish_categories
    WHERE name IN ('Home Catering', 'Side On', 'Special Event', 'Custom', 'Readily');
  `);

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
};
