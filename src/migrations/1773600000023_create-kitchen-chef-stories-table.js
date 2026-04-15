/**
 * Migration: Create kitchen_chef_stories table
 */

exports.up = (pgm) => {
  pgm.createTable(
    'kitchen_chef_stories',
    {
      id: {
        type: 'uuid',
        primaryKey: true,
        default: pgm.func('uuid_generate_v4()'),
        notNull: true,
      },
      kitchen_id: {
        type: 'uuid',
        notNull: true,
      },
      chef_name: {
        type: 'varchar(255)',
        notNull: true,
      },
      chef_bio: {
        type: 'text',
      },
      chef_journey: {
        type: 'text',
      },
      created_at: {
        type: 'timestamp',
        default: pgm.func('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: 'timestamp',
        default: pgm.func('CURRENT_TIMESTAMP'),
      },
      deleted_at: {
        type: 'timestamp',
      },
    },
    { ifNotExists: true },
  );

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE kitchen_chef_stories
        ADD CONSTRAINT fk_kitchen_chef_stories_kitchen
        FOREIGN KEY (kitchen_id) REFERENCES kitchens(id)
        ON UPDATE NO ACTION ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);
};

exports.down = (pgm) => {
  pgm.dropTable('kitchen_chef_stories', { ifExists: true, cascade: true });
};
