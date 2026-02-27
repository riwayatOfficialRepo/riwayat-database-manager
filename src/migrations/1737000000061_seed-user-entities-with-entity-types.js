/**
 * Migration: Seed user_entities table with all entity types
 * Types: CUSTOMER, PARTNER, TEAM, SYSTEM, RIDER
 */

exports.up = (pgm) => {
  pgm.sql(`
    INSERT INTO user_entities (entity_type, created_at, updated_at)
    VALUES
      ('CUSTOMER', NOW(), NOW()),
      ('PARTNER', NOW(), NOW()),
      ('TEAM', NOW(), NOW()),
      ('SYSTEM', NOW(), NOW()),
      ('RIDER', NOW(), NOW())
    ON CONFLICT (entity_type) DO NOTHING;
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    DELETE FROM user_entities
    WHERE entity_type IN ('PARTNER', 'TEAM', 'SYSTEM', 'RIDER');
  `);
};
