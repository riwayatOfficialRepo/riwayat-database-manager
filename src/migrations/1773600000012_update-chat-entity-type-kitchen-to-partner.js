/**
 * Migration: Rename chat_entities.entity_type value KITCHEN -> PARTNER
 * and update chat_entity_type enum accordingly.
 */

exports.up = (pgm) => {
  // Replace enum type with new value set that uses PARTNER.
  pgm.sql(`
    ALTER TYPE chat_entity_type RENAME TO chat_entity_type_old;
  `);

  pgm.sql(`
    CREATE TYPE chat_entity_type AS ENUM (
      'CUSTOMER',
      'PARTNER',
      'RIDER',
      'TEAM',
      'ORDER',
      'DISH',
      'DELIVERY',
      'COMPLAINT',
      'FEEDBACK',
      'SUPPORT_TICKET'
    );
  `);

  pgm.sql(`
    ALTER TABLE chat_entities
      ALTER COLUMN entity_type TYPE chat_entity_type
      USING (
        CASE
          WHEN entity_type::text = 'KITCHEN' THEN 'PARTNER'
          ELSE entity_type::text
        END
      )::chat_entity_type;
  `);

  pgm.sql(`
    DROP TYPE chat_entity_type_old;
  `);
};

exports.down = (pgm) => {
  // Rollback enum and data mapping PARTNER -> KITCHEN.
  pgm.sql(`
    ALTER TYPE chat_entity_type RENAME TO chat_entity_type_new;
  `);

  pgm.sql(`
    CREATE TYPE chat_entity_type AS ENUM (
      'CUSTOMER',
      'KITCHEN',
      'RIDER',
      'TEAM',
      'ORDER',
      'DISH',
      'DELIVERY',
      'COMPLAINT',
      'FEEDBACK',
      'SUPPORT_TICKET'
    );
  `);

  pgm.sql(`
    ALTER TABLE chat_entities
      ALTER COLUMN entity_type TYPE chat_entity_type
      USING (
        CASE
          WHEN entity_type::text = 'PARTNER' THEN 'KITCHEN'
          ELSE entity_type::text
        END
      )::chat_entity_type;
  `);

  pgm.sql(`
    DROP TYPE chat_entity_type_new;
  `);
};

