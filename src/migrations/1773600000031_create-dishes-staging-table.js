/**
 * Migration: Create dishes_staging table
 */

exports.up = (pgm) => {
  pgm.createTable(
    'dishes_staging',
    {
      id: {
        type: 'uuid',
        primaryKey: true,
        default: pgm.func('uuid_generate_v4()'),
        notNull: true,
      },
      dish_id: {
        type: 'uuid',
      },
      kitchen_staging_id: {
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
      status: {
        type: 'varchar(20)',
        default: 'DRAFT',
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
      ALTER TABLE dishes_staging
        ADD CONSTRAINT unique_staging_dish_name_per_kitchen UNIQUE (kitchen_staging_id, name);
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  // FK: dish_id -> dishes
  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE dishes_staging
        ADD CONSTRAINT dishes_staging_dish_id_fkey
        FOREIGN KEY (dish_id) REFERENCES dishes(id)
        ON UPDATE NO ACTION ON DELETE NO ACTION;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  // FK: kitchen_staging_id -> kitchens_staging
  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE dishes_staging
        ADD CONSTRAINT dishes_staging_kitchen_staging_id_fkey
        FOREIGN KEY (kitchen_staging_id) REFERENCES kitchens_staging(id)
        ON UPDATE NO ACTION ON DELETE NO ACTION;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  // FK: dish_category_id -> dish_categories (only if table exists)
  pgm.sql(`
    DO $$ BEGIN
      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'dish_categories') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'dishes_staging_dish_category_id_fkey') THEN
          ALTER TABLE dishes_staging
            ADD CONSTRAINT dishes_staging_dish_category_id_fkey
            FOREIGN KEY (dish_category_id) REFERENCES dish_categories(id)
            ON UPDATE NO ACTION ON DELETE NO ACTION;
        END IF;
      END IF;
    END $$;
  `);

  // FK: course_type_id -> dish_course_types
  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE dishes_staging
        ADD CONSTRAINT dishes_staging_course_type_id_fkey
        FOREIGN KEY (course_type_id) REFERENCES dish_course_types(id)
        ON UPDATE NO ACTION ON DELETE NO ACTION;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  // Check constraints
  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE dishes_staging
        ADD CONSTRAINT dishes_staging_preparation_mode_check
        CHECK (preparation_mode IN ('ready', 'pre_order'));
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE dishes_staging
        ADD CONSTRAINT dishes_staging_approx_preparation_time_check
        CHECK (approx_preparation_time >= 0);
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE dishes_staging
        ADD CONSTRAINT dishes_staging_preparation_time_unit_check
        CHECK (preparation_time_unit IN ('minutes', 'hours'));
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  // Partial index
  pgm.sql(`
    CREATE INDEX IF NOT EXISTS idx_dishes_staging_dishid_createdat_not_deleted
      ON dishes_staging (dish_id ASC NULLS LAST, created_at DESC NULLS FIRST)
      WHERE deleted_at IS NULL;
  `);
};

exports.down = (pgm) => {
  pgm.sql(`DROP INDEX IF EXISTS idx_dishes_staging_dishid_createdat_not_deleted;`);
  pgm.dropTable('dishes_staging', { ifExists: true, cascade: true });
};
