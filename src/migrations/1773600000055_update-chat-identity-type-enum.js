/**
 * Migration: Extend chat_identity_type for ChatParticipantService.identityTypeMap
 *
 * Adds ADMIN_TEAM and RIDER (mapped from TEAM / ADMIN_TEAM / RIDER user_entity_type).
 * Keeps legacy ADMIN_BRAND and RIDER_PERSONAL for existing rows and ChatService.initiate.
 *
 * identityTypeMap (riwayat-chat-module):
 *   CUSTOMER     -> CUSTOMER_PERSONAL
 *   PARTNER      -> KITCHEN_BRAND
 *   TEAM         -> ADMIN_TEAM
 *   ADMIN_TEAM   -> ADMIN_TEAM
 *   RIDER        -> RIDER
 */

exports.up = (pgm) => {
  pgm.sql(`
    ALTER TYPE chat_identity_type RENAME TO chat_identity_type_old;
  `);

  pgm.sql(`
    CREATE TYPE chat_identity_type AS ENUM (
      'CUSTOMER_PERSONAL',
      'KITCHEN_BRAND',
      'ADMIN_BRAND',
      'ADMIN_TEAM',
      'RIDER_PERSONAL',
      'RIDER'
    );
  `);

  pgm.sql(`
    ALTER TABLE chat_participants
      ALTER COLUMN identity_type TYPE chat_identity_type
      USING (identity_type::text)::chat_identity_type;
  `);

  pgm.sql(`
    DROP TYPE chat_identity_type_old;
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    UPDATE chat_participants
    SET identity_type = 'ADMIN_BRAND'
    WHERE identity_type::text = 'ADMIN_TEAM';
  `);

  pgm.sql(`
    UPDATE chat_participants
    SET identity_type = 'RIDER_PERSONAL'
    WHERE identity_type::text = 'RIDER';
  `);

  pgm.sql(`
    ALTER TYPE chat_identity_type RENAME TO chat_identity_type_new;
  `);

  pgm.sql(`
    CREATE TYPE chat_identity_type AS ENUM (
      'CUSTOMER_PERSONAL',
      'KITCHEN_BRAND',
      'ADMIN_BRAND',
      'RIDER_PERSONAL'
    );
  `);

  pgm.sql(`
    ALTER TABLE chat_participants
      ALTER COLUMN identity_type TYPE chat_identity_type
      USING (identity_type::text)::chat_identity_type;
  `);

  pgm.sql(`
    DROP TYPE chat_identity_type_new;
  `);
};
