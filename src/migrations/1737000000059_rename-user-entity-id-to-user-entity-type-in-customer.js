/**
 * Migration: Rename user_entity_id to user_entity_type in customer table
 * Replaces UUID foreign key with ENUM string type
 * ENUM values: CUSTOMER, PARTNER, TEAM, SYSTEM, RIDER
 */

exports.up = (pgm) => {
  // Create user_entity_type enum
  pgm.sql(`
    DO $$ BEGIN
      CREATE TYPE user_entity_type AS ENUM (
        'CUSTOMER',
        'PARTNER',
        'TEAM',
        'SYSTEM',
        'RIDER'
      );
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  // Add new column (nullable initially)
  pgm.addColumn('customer', {
    user_entity_type: {
      type: 'user_entity_type',
      notNull: false,
    },
  });

  // Backfill: all existing customer rows get CUSTOMER type
  pgm.sql(`
    UPDATE customer
    SET user_entity_type = 'CUSTOMER'
    WHERE user_entity_type IS NULL;
  `);

  // Make NOT NULL
  pgm.sql(`
    ALTER TABLE customer ALTER COLUMN user_entity_type SET NOT NULL;
  `);

  // Drop foreign key constraint
  pgm.sql(`
    ALTER TABLE customer DROP CONSTRAINT IF EXISTS fk_customer_user_entity;
  `);

  // Drop index
  pgm.dropIndex('customer', 'user_entity_id', {
    name: 'idx_customer_user_entity_id',
    ifExists: true,
  });

  // Drop old column
  pgm.dropColumn('customer', 'user_entity_id');

  // Create index for lookups
  pgm.createIndex('customer', 'user_entity_type', {
    name: 'idx_customer_user_entity_type',
    ifNotExists: true,
  });
};

exports.down = (pgm) => {
  // Drop new index
  pgm.dropIndex('customer', 'user_entity_type', {
    name: 'idx_customer_user_entity_type',
    ifExists: true,
  });

  // Re-add user_entity_id column (nullable initially)
  pgm.addColumn('customer', {
    user_entity_id: {
      type: 'uuid',
      notNull: false,
    },
  });

  // Backfill from user_entities table
  pgm.sql(`
    UPDATE customer
    SET user_entity_id = (SELECT id FROM user_entities WHERE entity_type = 'CUSTOMER' LIMIT 1)
    WHERE user_entity_id IS NULL;
  `);

  pgm.sql(`
    ALTER TABLE customer ALTER COLUMN user_entity_id SET NOT NULL;
  `);

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE customer
      ADD CONSTRAINT fk_customer_user_entity
      FOREIGN KEY (user_entity_id) REFERENCES user_entities(id)
      ON UPDATE CASCADE ON DELETE RESTRICT;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  pgm.createIndex('customer', 'user_entity_id', {
    name: 'idx_customer_user_entity_id',
    ifNotExists: true,
  });

  pgm.dropColumn('customer', 'user_entity_type');
  pgm.dropType('user_entity_type', { ifExists: true });
};
