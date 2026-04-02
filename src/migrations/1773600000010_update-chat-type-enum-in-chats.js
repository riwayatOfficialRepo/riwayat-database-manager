/**
 * Migration: Update chats.chat_type enum values to match chat module constants
 *
 * New values:
 * - CUSTOMER_KITCHEN
 * - KITCHEN_CUSTOMER
 * - CUSTOMER_ADMIN
 * - ADMIN_CUSTOMER
 * - ADMIN_KITCHEN
 * - KITCHEN_ADMIN
 */

exports.up = (pgm) => {
  pgm.sql(`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1
        FROM chats
        WHERE chat_type::text NOT IN (
          'CUSTOMER_KITCHEN',
          'KITCHEN_CUSTOMER',
          'CUSTOMER_ADMIN',
          'ADMIN_CUSTOMER',
          'ADMIN_KITCHEN',
          'KITCHEN_ADMIN'
        )
      ) THEN
        RAISE EXCEPTION 'Cannot migrate chat_type enum: existing chats contain unsupported values.';
      END IF;
    END
    $$;
  `);

  pgm.sql(`
    ALTER TYPE chat_type RENAME TO chat_type_old;
  `);

  pgm.sql(`
    CREATE TYPE chat_type AS ENUM (
      'CUSTOMER_KITCHEN',
      'KITCHEN_CUSTOMER',
      'CUSTOMER_ADMIN',
      'ADMIN_CUSTOMER',
      'ADMIN_KITCHEN',
      'KITCHEN_ADMIN'
    );
  `);

  pgm.sql(`
    ALTER TABLE chats
      ALTER COLUMN chat_type TYPE chat_type
      USING chat_type::text::chat_type;
  `);

  pgm.sql(`
    DROP TYPE chat_type_old;
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1
        FROM chats
        WHERE chat_type::text NOT IN (
          'CUSTOMER_KITCHEN',
          'CUSTOMER_ADMIN',
          'ADMIN_KITCHEN'
        )
      ) THEN
        RAISE EXCEPTION 'Cannot rollback chat_type enum: existing chats contain values not present in old enum.';
      END IF;
    END
    $$;
  `);

  pgm.sql(`
    ALTER TYPE chat_type RENAME TO chat_type_new;
  `);

  pgm.sql(`
    CREATE TYPE chat_type AS ENUM (
      'CUSTOMER_KITCHEN',
      'CUSTOMER_ADMIN',
      'CUSTOMER_RIDER',
      'ADMIN_KITCHEN',
      'ADMIN_RIDER',
      'ADMIN_ADMIN'
    );
  `);

  pgm.sql(`
    ALTER TABLE chats
      ALTER COLUMN chat_type TYPE chat_type
      USING chat_type::text::chat_type;
  `);

  pgm.sql(`
    DROP TYPE chat_type_new;
  `);
};

