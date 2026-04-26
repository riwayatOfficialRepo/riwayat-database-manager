/**
 * Migration: Create prospects table
 * Stores prospect data for kitchen onboarding with status tracking.
 */

exports.up = (pgm) => {
  pgm.createTable(
    'prospects',
    {
      prospect_id: {
        type: 'uuid',
        primaryKey: true,
        default: pgm.func('uuid_generate_v4()'),
        notNull: true,
      },
      entity_id: {
        type: 'uuid',
      },
      data_provided: {
        type: 'jsonb',
        notNull: true,
      },
      status: {
        type: 'varchar(20)',
        notNull: true,
        default: 'INITIATED',
      },
      created_at: {
        type: 'timestamp',
        notNull: true,
        default: pgm.func('CURRENT_TIMESTAMP'),
      },
      last_updated: {
        type: 'timestamp',
        notNull: true,
        default: pgm.func('CURRENT_TIMESTAMP'),
      },
      kitchen_user_id: {
        type: 'uuid',
      },
      created_by: {
        type: 'uuid',
      },
    },
    { ifNotExists: true },
  );

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE prospects
        ADD CONSTRAINT fk_prospects_kitchen_user
        FOREIGN KEY (kitchen_user_id) REFERENCES kitchen_users(id)
        ON UPDATE NO ACTION ON DELETE NO ACTION;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE prospects
        ADD CONSTRAINT prospects_status_check
        CHECK (status IN ('INITIATED', 'SUBMITTED'));
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);
};

exports.down = (pgm) => {
  pgm.dropTable('prospects', { ifExists: true, cascade: true });
};
