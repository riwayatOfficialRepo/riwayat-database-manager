exports.up = (pgm) => {
  pgm.createTable('user_entities', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    entity_type: {
      type: 'varchar(50)',
      notNull: true,
    },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('now()'),
    },
    updated_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('now()'),
    },
  }, { ifNotExists: true });

  pgm.createIndex('user_entities', 'entity_type', {
    name: 'idx_user_entities_entity_type',
    unique: true,
    ifNotExists: true,
  });

  // Seed the first entity type: CUSTOMER
  pgm.sql(`
    INSERT INTO user_entities (entity_type, created_at, updated_at)
    VALUES ('CUSTOMER', NOW(), NOW())
    ON CONFLICT (entity_type) DO NOTHING;
  `);
};

exports.down = (pgm) => {
  pgm.dropIndex('user_entities', 'entity_type', {
    name: 'idx_user_entities_entity_type',
    ifExists: true,
  });
  pgm.dropTable('user_entities', { ifExists: true });
};
