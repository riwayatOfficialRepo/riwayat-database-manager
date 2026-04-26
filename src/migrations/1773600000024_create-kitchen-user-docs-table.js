/**
 * Migration: Create kitchen_user_docs table
 */

exports.up = (pgm) => {
  pgm.createTable(
    'kitchen_user_docs',
    {
      id: {
        type: 'uuid',
        primaryKey: true,
        default: pgm.func('gen_random_uuid()'),
        notNull: true,
      },
      kitchen_user_id: {
        type: 'uuid',
        notNull: true,
      },
      doc_type: {
        type: 'varchar(100)',
        notNull: true,
      },
      doc_number: {
        type: 'varchar(255)',
        notNull: true,
      },
      created_at: {
        type: 'timestamp',
        notNull: true,
        default: pgm.func('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: 'timestamp',
      },
      deleted_at: {
        type: 'timestamp',
      },
      verified_at: {
        type: 'timestamp',
      },
      status: {
        type: 'varchar(50)',
        default: 'pending',
      },
    },
    { ifNotExists: true },
  );

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE kitchen_user_docs
        ADD CONSTRAINT fk_kitchen_user
        FOREIGN KEY (kitchen_user_id) REFERENCES kitchen_users(id)
        ON UPDATE NO ACTION ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);
};

exports.down = (pgm) => {
  pgm.dropTable('kitchen_user_docs', { ifExists: true, cascade: true });
};
