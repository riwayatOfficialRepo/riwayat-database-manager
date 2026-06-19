/**
 * Migration: Add RESOLVED chat status and status-change audit columns
 */

exports.up = (pgm) => {
  pgm.sql(`
    ALTER TYPE chat_status RENAME TO chat_status_old;
  `);

  pgm.sql(`
    CREATE TYPE chat_status AS ENUM (
      'OPEN',
      'CLOSED',
      'RESOLVED',
      'ARCHIVED'
    );
  `);

  pgm.sql(`
    ALTER TABLE chats
      ALTER COLUMN status DROP DEFAULT;
  `);

  pgm.sql(`
    ALTER TABLE chats
      ALTER COLUMN status TYPE chat_status
      USING status::text::chat_status;
  `);

  pgm.sql(`
    ALTER TABLE chats
      ALTER COLUMN status SET DEFAULT 'OPEN'::chat_status;
  `);

  pgm.sql(`
    DROP TYPE chat_status_old;
  `);

  pgm.addColumns('chats', {
    is_reopened: {
      type: 'boolean',
      notNull: true,
      default: false,
    },
    reopened_details: {
      type: 'jsonb',
    },
    closed_details: {
      type: 'jsonb',
    },
    resolved_details: {
      type: 'jsonb',
    },
  });
};

exports.down = (pgm) => {
  pgm.sql(`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM chats WHERE status::text = 'RESOLVED'
      ) THEN
        RAISE EXCEPTION 'Cannot rollback: chats with RESOLVED status exist';
      END IF;
    END
    $$;
  `);

  pgm.dropColumns('chats', [
    'is_reopened',
    'reopened_details',
    'closed_details',
    'resolved_details',
  ]);

  pgm.sql(`
    ALTER TYPE chat_status RENAME TO chat_status_old;
  `);

  pgm.sql(`
    CREATE TYPE chat_status AS ENUM (
      'OPEN',
      'CLOSED',
      'ARCHIVED'
    );
  `);

  pgm.sql(`
    ALTER TABLE chats
      ALTER COLUMN status DROP DEFAULT;
  `);

  pgm.sql(`
    ALTER TABLE chats
      ALTER COLUMN status TYPE chat_status
      USING status::text::chat_status;
  `);

  pgm.sql(`
    ALTER TABLE chats
      ALTER COLUMN status SET DEFAULT 'OPEN'::chat_status;
  `);

  pgm.sql(`
    DROP TYPE chat_status_old;
  `);
};
