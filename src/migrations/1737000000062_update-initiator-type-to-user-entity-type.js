/**
 * Migration: Update initiator_type and role to use user_entity_type enum
 * Replaces chat_initiator_type and chat_participant_role with user_entity_type
 * Values: CUSTOMER, PARTNER, TEAM, SYSTEM, RIDER
 *
 * Mapping: KITCHEN_USER -> PARTNER, ADMIN -> TEAM
 * Depends on user_entity_type enum from migration 1737000000059
 */

exports.up = (pgm) => {
  // === chats.initiator_type ===
  pgm.addColumn('chats', {
    initiator_type_new: {
      type: 'user_entity_type',
      notNull: false,
    },
  });

  pgm.sql(`
    UPDATE chats
    SET initiator_type_new = CASE
      WHEN initiator_type::text = 'KITCHEN_USER' THEN 'PARTNER'::user_entity_type
      WHEN initiator_type::text = 'ADMIN' THEN 'TEAM'::user_entity_type
      WHEN initiator_type::text = 'CUSTOMER' THEN 'CUSTOMER'::user_entity_type
      WHEN initiator_type::text = 'RIDER' THEN 'RIDER'::user_entity_type
      ELSE 'CUSTOMER'::user_entity_type
    END
  `);

  pgm.sql(`ALTER TABLE chats ALTER COLUMN initiator_type_new SET NOT NULL`);
  pgm.dropColumn('chats', 'initiator_type');
  pgm.renameColumn('chats', 'initiator_type_new', 'initiator_type');
  pgm.dropType('chat_initiator_type', { ifExists: true });

  // === chat_participants.role ===
  pgm.addColumn('chat_participants', {
    role_new: {
      type: 'user_entity_type',
      notNull: false,
    },
  });

  pgm.sql(`
    UPDATE chat_participants
    SET role_new = CASE
      WHEN role::text = 'ADMIN' THEN 'TEAM'::user_entity_type
      WHEN role::text = 'CUSTOMER' THEN 'CUSTOMER'::user_entity_type
      WHEN role::text = 'PARTNER' THEN 'PARTNER'::user_entity_type
      WHEN role::text = 'RIDER' THEN 'RIDER'::user_entity_type
      ELSE 'CUSTOMER'::user_entity_type
    END
  `);

  pgm.sql(`ALTER TABLE chat_participants ALTER COLUMN role_new SET NOT NULL`);
  pgm.dropColumn('chat_participants', 'role');
  pgm.renameColumn('chat_participants', 'role_new', 'role');
  pgm.dropType('chat_participant_role', { ifExists: true });
};

exports.down = (pgm) => {
  // Recreate chat_participant_role enum
  pgm.sql(`
    DO $$ BEGIN
      CREATE TYPE chat_participant_role AS ENUM ('CUSTOMER', 'PARTNER', 'RIDER', 'ADMIN');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  pgm.addColumn('chat_participants', {
    role_old: {
      type: 'chat_participant_role',
      notNull: false,
    },
  });

  pgm.sql(`
    UPDATE chat_participants
    SET role_old = CASE
      WHEN role::text = 'TEAM' THEN 'ADMIN'::chat_participant_role
      WHEN role::text = 'SYSTEM' THEN 'ADMIN'::chat_participant_role
      WHEN role::text = 'CUSTOMER' THEN 'CUSTOMER'::chat_participant_role
      WHEN role::text = 'PARTNER' THEN 'PARTNER'::chat_participant_role
      WHEN role::text = 'RIDER' THEN 'RIDER'::chat_participant_role
      ELSE 'CUSTOMER'::chat_participant_role
    END
  `);

  pgm.sql(`ALTER TABLE chat_participants ALTER COLUMN role_old SET NOT NULL`);
  pgm.dropColumn('chat_participants', 'role');
  pgm.renameColumn('chat_participants', 'role_old', 'role');

  // Recreate chat_initiator_type enum
  pgm.sql(`
    DO $$ BEGIN
      CREATE TYPE chat_initiator_type AS ENUM ('CUSTOMER', 'KITCHEN_USER', 'RIDER', 'ADMIN');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  pgm.addColumn('chats', {
    initiator_type_old: {
      type: 'chat_initiator_type',
      notNull: false,
    },
  });

  pgm.sql(`
    UPDATE chats
    SET initiator_type_old = CASE
      WHEN initiator_type::text = 'PARTNER' THEN 'KITCHEN_USER'::chat_initiator_type
      WHEN initiator_type::text = 'TEAM' THEN 'ADMIN'::chat_initiator_type
      WHEN initiator_type::text = 'SYSTEM' THEN 'ADMIN'::chat_initiator_type
      WHEN initiator_type::text = 'CUSTOMER' THEN 'CUSTOMER'::chat_initiator_type
      WHEN initiator_type::text = 'RIDER' THEN 'RIDER'::chat_initiator_type
      ELSE 'CUSTOMER'::chat_initiator_type
    END
  `);

  pgm.sql(`ALTER TABLE chats ALTER COLUMN initiator_type_old SET NOT NULL`);
  pgm.dropColumn('chats', 'initiator_type');
  pgm.renameColumn('chats', 'initiator_type_old', 'initiator_type');
};
