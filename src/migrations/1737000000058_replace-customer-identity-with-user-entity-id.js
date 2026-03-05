exports.up = (pgm) => {
  // Add user_entity_id column (nullable initially for backfill)
  pgm.addColumn('customer', {
    user_entity_id: {
      type: 'uuid',
      notNull: false,
    },
  });

  // Backfill: set user_entity_id to CUSTOMER entity for all existing rows
  pgm.sql(`
    UPDATE customer
    SET user_entity_id = (SELECT id FROM user_entities WHERE entity_type = 'CUSTOMER' LIMIT 1)
    WHERE user_entity_id IS NULL;
  `);

  // Make user_entity_id NOT NULL
  pgm.sql(`
    ALTER TABLE customer ALTER COLUMN user_entity_id SET NOT NULL;
  `);

  // Add foreign key constraint
  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE customer
      ADD CONSTRAINT fk_customer_user_entity
      FOREIGN KEY (user_entity_id) REFERENCES user_entities(id)
      ON UPDATE CASCADE ON DELETE RESTRICT;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  // Create index for lookups
  pgm.createIndex('customer', 'user_entity_id', {
    name: 'idx_customer_user_entity_id',
    ifNotExists: true,
  });

  // Drop identity column (if it exists)
  pgm.sql(`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'customer' AND column_name = 'identity'
      ) THEN
        ALTER TABLE customer DROP COLUMN identity;
      END IF;
    END $$;
  `);
};

exports.down = (pgm) => {
  // Re-add identity column
  pgm.addColumn('customer', {
    identity: {
      type: 'varchar(20)',
      notNull: true,
      default: 'CUSTOMER',
    },
  });

  // Drop foreign key and index
  pgm.sql(`
    ALTER TABLE customer DROP CONSTRAINT IF EXISTS fk_customer_user_entity;
  `);
  pgm.dropIndex('customer', 'user_entity_id', {
    name: 'idx_customer_user_entity_id',
    ifExists: true,
  });

  // Drop user_entity_id column
  pgm.dropColumn('customer', 'user_entity_id');
};
