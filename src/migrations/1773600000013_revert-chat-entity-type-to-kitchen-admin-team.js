/**
 * Migration: Revert chat_entity_type back to legacy values.
 *
 * Restores enum values:
 * - KITCHEN (instead of PARTNER)
 * - ADMIN_TEAM (instead of TEAM)
 */

exports.up = (pgm) => {
  // Recreate enum with legacy values and remap current data accordingly.
  pgm.sql(`
    ALTER TYPE chat_entity_type RENAME TO chat_entity_type_new;
  `);

  pgm.sql(`
    CREATE TYPE chat_entity_type AS ENUM (
      'CUSTOMER',
      'KITCHEN',
      'RIDER',
      'ADMIN_TEAM',
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
          WHEN entity_type::text = 'TEAM' THEN 'ADMIN_TEAM'
          ELSE entity_type::text
        END
      )::chat_entity_type;
  `);

  pgm.sql(`
    DROP TYPE chat_entity_type_new;
  `);
};

exports.down = (pgm) => {
  // Re-apply latest style values (PARTNER + TEAM) if needed.
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
          WHEN entity_type::text = 'ADMIN_TEAM' THEN 'TEAM'
          ELSE entity_type::text
        END
      )::chat_entity_type;
  `);

  pgm.sql(`
    DROP TYPE chat_entity_type_old;
  `);
};

