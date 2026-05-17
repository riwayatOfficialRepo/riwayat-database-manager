/**
 * Migration: Create promotion_codes and promotion_codes_staging tables
 */

exports.up = (pgm) => {
  // ── trigger functions ────────────────────────────────────────
  pgm.sql(`
    CREATE OR REPLACE FUNCTION update_promotion_codes_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  pgm.sql(`
    CREATE OR REPLACE FUNCTION update_promotion_codes_staging_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  // ── promotion_codes ──────────────────────────────────────────
  pgm.createTable(
    'promotion_codes',
    {
      id: {
        type: 'uuid',
        primaryKey: true,
        default: pgm.func('gen_random_uuid()'),
        notNull: true,
      },
      promotion_id: { type: 'uuid' },
      code: { type: 'varchar(64)' },
      case_sensitive: { type: 'boolean', default: false },
      reference_code: { type: 'varchar(100)' },
      description: { type: 'text' },
      status: { type: 'varchar(20)', default: "'DRAFT'" },
      created_at: { type: 'timestamp', notNull: true, default: pgm.func('now()') },
      updated_at: { type: 'timestamp', notNull: true, default: pgm.func('now()') },
      deleted_at: { type: 'timestamp' },
    },
    { ifNotExists: true },
  );

  // FK: promotion_id -> promotions
  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE promotion_codes
        ADD CONSTRAINT promotion_codes_promotion_id_fkey
        FOREIGN KEY (promotion_id) REFERENCES promotions(id)
        ON UPDATE NO ACTION ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  // Unique: promotion_id + code
  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE promotion_codes
        ADD CONSTRAINT promotion_codes_promotion_id_code_key UNIQUE (promotion_id, code);
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  pgm.sql(`
    CREATE OR REPLACE TRIGGER trg_promotion_codes_updated_at
      BEFORE UPDATE ON promotion_codes
      FOR EACH ROW
      EXECUTE FUNCTION update_promotion_codes_updated_at();
  `);

  // ── promotion_codes_staging ──────────────────────────────────
  pgm.createTable(
    'promotion_codes_staging',
    {
      id: {
        type: 'uuid',
        primaryKey: true,
        default: pgm.func('gen_random_uuid()'),
        notNull: true,
      },
      promotion_id: { type: 'uuid' },
      promotion_code_id: { type: 'uuid' },
      code: { type: 'varchar(64)' },
      case_sensitive: { type: 'boolean', default: false },
      requested_by: { type: 'uuid' },
      reference_code: { type: 'varchar(100)' },
      description: { type: 'text' },
      status: { type: 'varchar(20)', default: "'DRAFT'" },
      created_at: { type: 'timestamp', notNull: true, default: pgm.func('now()') },
      updated_at: { type: 'timestamp', notNull: true, default: pgm.func('now()') },
      deleted_at: { type: 'timestamp' },
    },
    { ifNotExists: true },
  );

  // FK: promotion_id -> promotions
  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE promotion_codes_staging
        ADD CONSTRAINT promotion_codes_staging_promotion_id_fkey
        FOREIGN KEY (promotion_id) REFERENCES promotions(id)
        ON UPDATE NO ACTION ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  // FK: promotion_code_id -> promotion_codes
  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE promotion_codes_staging
        ADD CONSTRAINT promotion_codes_staging_promotion_code_id_fkey
        FOREIGN KEY (promotion_code_id) REFERENCES promotion_codes(id)
        ON UPDATE NO ACTION ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  pgm.sql(`
    CREATE OR REPLACE TRIGGER trg_promotion_codes_staging_updated_at
      BEFORE UPDATE ON promotion_codes_staging
      FOR EACH ROW
      EXECUTE FUNCTION update_promotion_codes_staging_updated_at();
  `);
};

exports.down = (pgm) => {
  pgm.sql(`DROP TRIGGER IF EXISTS trg_promotion_codes_staging_updated_at ON promotion_codes_staging`);
  pgm.dropTable('promotion_codes_staging', { ifExists: true, cascade: true });
  pgm.sql(`DROP TRIGGER IF EXISTS trg_promotion_codes_updated_at ON promotion_codes`);
  pgm.dropTable('promotion_codes', { ifExists: true, cascade: true });
  pgm.sql(`DROP FUNCTION IF EXISTS update_promotion_codes_staging_updated_at()`);
  pgm.sql(`DROP FUNCTION IF EXISTS update_promotion_codes_updated_at()`);
};
