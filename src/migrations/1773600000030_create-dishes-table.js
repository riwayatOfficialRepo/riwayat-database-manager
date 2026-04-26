/**
 * Migration: Create dishes table
 */

exports.up = (pgm) => {
  pgm.createTable(
    'dishes',
    {
      id: {
        type: 'uuid',
        primaryKey: true,
        default: pgm.func('uuid_generate_v4()'),
        notNull: true,
      },
      kitchen_id: {
        type: 'uuid',
      },
      dish_category_id: {
        type: 'integer',
      },
      course_type_id: {
        type: 'integer',
      },
      name: {
        type: 'text',
      },
      story: {
        type: 'text',
      },
      description: {
        type: 'text',
      },
      is_active: {
        type: 'boolean',
        default: true,
      },
      is_customization_allowed: {
        type: 'boolean',
        default: true,
      },
      preparation_mode: {
        type: 'varchar(20)',
        default: 'ready',
      },
      is_negotiable: {
        type: 'boolean',
        default: true,
      },
      approx_preparation_time: {
        type: 'integer',
      },
      preparation_time_unit: {
        type: 'varchar(20)',
        default: 'minutes',
      },
      created_at: {
        type: 'timestamp',
        default: pgm.func('now()'),
      },
      updated_at: {
        type: 'timestamp',
        default: pgm.func('now()'),
      },
      deleted_at: {
        type: 'timestamp',
      },
      status: {
        type: 'varchar(50)',
        default: 'DRAFT',
      },
      change_in_progress: {
        type: 'boolean',
        default: false,
      },
      dish_business_ref: {
        type: 'text',
      },
    },
    { ifNotExists: true },
  );

  // Unique constraint
  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE dishes
        ADD CONSTRAINT unique_dish_name_per_kitchen UNIQUE (kitchen_id, name);
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  // FK: kitchen_id -> kitchens
  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE dishes
        ADD CONSTRAINT dishes_kitchen_id_fkey
        FOREIGN KEY (kitchen_id) REFERENCES kitchens(id)
        ON UPDATE NO ACTION ON DELETE NO ACTION;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  // FK: dish_category_id -> dish_categories (only if table exists)
  pgm.sql(`
    DO $$ BEGIN
      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'dish_categories') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'dishes_dish_category_id_fkey') THEN
          ALTER TABLE dishes
            ADD CONSTRAINT dishes_dish_category_id_fkey
            FOREIGN KEY (dish_category_id) REFERENCES dish_categories(id)
            ON UPDATE NO ACTION ON DELETE NO ACTION;
        END IF;
      END IF;
    END $$;
  `);

  // FK: course_type_id -> dish_course_types
  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE dishes
        ADD CONSTRAINT dishes_course_type_id_fkey
        FOREIGN KEY (course_type_id) REFERENCES dish_course_types(id)
        ON UPDATE NO ACTION ON DELETE NO ACTION;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  // Check constraints
  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE dishes
        ADD CONSTRAINT dishes_preparation_mode_check
        CHECK (preparation_mode IN ('ready', 'pre_order'));
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE dishes
        ADD CONSTRAINT dishes_approx_preparation_time_check
        CHECK (approx_preparation_time >= 0);
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE dishes
        ADD CONSTRAINT dishes_preparation_time_unit_check
        CHECK (preparation_time_unit IN ('minutes', 'hours'));
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  // Index
  pgm.createIndex('dishes', 'kitchen_id', {
    name: 'idx_dishes_kitchen_id',
    ifNotExists: true,
  });
};

exports.down = (pgm) => {
  pgm.dropIndex('dishes', 'kitchen_id', { name: 'idx_dishes_kitchen_id', ifExists: true });
  pgm.dropTable('dishes', { ifExists: true, cascade: true });
};
