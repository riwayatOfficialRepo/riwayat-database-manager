/**
 * Migration: Create menu_dishes table
 */

exports.up = (pgm) => {
  pgm.createTable(
    'menu_dishes',
    {
      id: {
        type: 'uuid',
        primaryKey: true,
        default: pgm.func('gen_random_uuid()'),
        notNull: true,
      },
      menu_id: {
        type: 'uuid',
        notNull: true,
      },
      dish_id: {
        type: 'uuid',
        notNull: true,
      },
      display_order: {
        type: 'integer',
        notNull: true,
        default: 0,
      },
      created_at: {
        type: 'timestamp',
        notNull: true,
        default: pgm.func('now()'),
      },
    },
    { ifNotExists: true },
  );

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE menu_dishes
        ADD CONSTRAINT uq_menu_dish UNIQUE (menu_id, dish_id);
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE menu_dishes
        ADD CONSTRAINT uq_menu_order UNIQUE (menu_id, display_order);
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE menu_dishes
        ADD CONSTRAINT fk_menu
        FOREIGN KEY (menu_id) REFERENCES menus(id)
        ON UPDATE NO ACTION ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE menu_dishes
        ADD CONSTRAINT fk_dish
        FOREIGN KEY (dish_id) REFERENCES dishes(id)
        ON UPDATE NO ACTION ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  pgm.createIndex('menu_dishes', 'menu_id', {
    name: 'idx_menu_dishes_menu_id',
    ifNotExists: true,
  });

  pgm.createIndex('menu_dishes', ['menu_id', 'display_order'], {
    name: 'idx_menu_dishes_order',
    ifNotExists: true,
  });
};

exports.down = (pgm) => {
  pgm.dropIndex('menu_dishes', 'menu_id', { name: 'idx_menu_dishes_menu_id', ifExists: true });
  pgm.dropIndex('menu_dishes', ['menu_id', 'display_order'], { name: 'idx_menu_dishes_order', ifExists: true });
  pgm.dropTable('menu_dishes', { ifExists: true, cascade: true });
};
