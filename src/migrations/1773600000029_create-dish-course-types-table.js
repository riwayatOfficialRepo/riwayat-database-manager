/**
 * Migration: Create dish_course_types table
 */

exports.up = (pgm) => {
  pgm.createTable(
    'dish_course_types',
    {
      id: {
        type: 'serial',
        primaryKey: true,
      },
      name: {
        type: 'text',
        notNull: true,
      },
      label_key: {
        type: 'text',
      },
      status: {
        type: 'varchar(20)',
        default: 'ACTIVE',
      },
      created_at: {
        type: 'timestamp',
        default: pgm.func('now()'),
      },
    },
    { ifNotExists: true },
  );

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE dish_course_types
        ADD CONSTRAINT dish_course_types_name_key UNIQUE (name);
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);
};

exports.down = (pgm) => {
  pgm.dropTable('dish_course_types', { ifExists: true, cascade: true });
};
