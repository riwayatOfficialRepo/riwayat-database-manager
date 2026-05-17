/**
 * Migration: Create audience_rules and audience_rules_staging tables
 */

exports.up = (pgm) => {
  // ── audience_rules ───────────────────────────────────────────
  pgm.createTable(
    'audience_rules',
    {
      id: {
        type: 'uuid',
        primaryKey: true,
        default: pgm.func('gen_random_uuid()'),
        notNull: true,
      },
      promotion_id: { type: 'uuid', notNull: true },
      rule_type: { type: 'varchar(40)', notNull: true },
      params_json: { type: 'jsonb' },
      ordinal: { type: 'integer', notNull: true, default: 1 },
      status: { type: 'varchar(20)', notNull: true, default: "'ACTIVE'" },
      created_at: { type: 'timestamp', notNull: true, default: pgm.func('now()') },
      updated_at: { type: 'timestamp', notNull: true, default: pgm.func('now()') },
      deleted_at: { type: 'timestamp' },
    },
    { ifNotExists: true },
  );

  // FK: promotion_id -> promotions
  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE audience_rules
        ADD CONSTRAINT audience_rules_promotion_id_fkey
        FOREIGN KEY (promotion_id) REFERENCES promotions(id)
        ON UPDATE NO ACTION ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  // ── audience_rules_staging ───────────────────────────────────
  pgm.createTable(
    'audience_rules_staging',
    {
      id: {
        type: 'uuid',
        primaryKey: true,
        default: pgm.func('gen_random_uuid()'),
        notNull: true,
      },
      promotion_id: { type: 'uuid', notNull: true },
      audience_rule_id: { type: 'uuid' },
      rule_type: { type: 'varchar(40)', notNull: true },
      params_json: { type: 'jsonb' },
      ordinal: { type: 'integer', notNull: true, default: 1 },
      status: { type: 'varchar(20)', notNull: true, default: "'DRAFT'" },
      created_at: { type: 'timestamp', notNull: true, default: pgm.func('now()') },
      updated_at: { type: 'timestamp', notNull: true, default: pgm.func('now()') },
      deleted_at: { type: 'timestamp' },
    },
    { ifNotExists: true },
  );

  // FK: promotion_id -> promotions
  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE audience_rules_staging
        ADD CONSTRAINT audience_rules_staging_promotion_id_fkey
        FOREIGN KEY (promotion_id) REFERENCES promotions(id)
        ON UPDATE NO ACTION ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  // FK: audience_rule_id -> audience_rules
  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE audience_rules_staging
        ADD CONSTRAINT audience_rules_staging_audience_rule_id_fkey
        FOREIGN KEY (audience_rule_id) REFERENCES audience_rules(id)
        ON UPDATE NO ACTION ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);
};

exports.down = (pgm) => {
  pgm.dropTable('audience_rules_staging', { ifExists: true, cascade: true });
  pgm.dropTable('audience_rules', { ifExists: true, cascade: true });
};
