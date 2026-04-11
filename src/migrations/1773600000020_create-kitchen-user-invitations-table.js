/**
 * Migration: Create kitchen_user_invitations table
 */

exports.up = (pgm) => {
  pgm.createTable(
    'kitchen_user_invitations',
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
      invited_by_id: {
        type: 'uuid',
      },
      phone: {
        type: 'text',
        notNull: true,
      },
      role: {
        type: 'text',
        notNull: true,
      },
      status: {
        type: 'text',
        default: 'pending',
      },
      invitation_code: {
        type: 'text',
      },
      expires_at: {
        type: 'timestamp',
      },
      created_at: {
        type: 'timestamp',
        default: pgm.func('now()'),
      },
      deleted_at: {
        type: 'timestamp',
      },
      name: {
        type: 'varchar(255)',
      },
      email: {
        type: 'varchar(255)',
      },
      updated_at: {
        type: 'timestamp',
        default: pgm.func('now()'),
      },
    },
    { ifNotExists: true },
  );

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE kitchen_user_invitations
        ADD CONSTRAINT kitchen_user_invitations_invited_by_id_fkey
        FOREIGN KEY (invited_by_id) REFERENCES kitchen_users(id)
        ON UPDATE NO ACTION ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);
};

exports.down = (pgm) => {
  pgm.dropTable('kitchen_user_invitations', { ifExists: true, cascade: true });
};
