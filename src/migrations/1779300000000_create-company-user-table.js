/**
 * Corporate company_user table — same shape as admin_users (portal auth / users).
 * Depends on user_entity_type enum (migration 1737000000059).
 */

exports.up = (pgm) => {
  pgm.sql('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

  pgm.createTable(
    'company_user',
    {
      id: {
        type: 'uuid',
        primaryKey: true,
        default: pgm.func('uuid_generate_v4()'),
      },
      name: { type: 'text', notNull: true },
      email: { type: 'text', notNull: true },
      company_code: { type: 'varchar(50)', notNull: true },
      phone: { type: 'text' },
      password_hash: { type: 'text', notNull: true },
      is_active: { type: 'boolean', default: true },
      last_login: { type: 'timestamp' },
      created_at: { type: 'timestamp', default: pgm.func('now()') },
      updated_at: { type: 'timestamp', default: pgm.func('now()') },
      deleted_at: { type: 'timestamp' },
      user_entity_type: {
        type: 'user_entity_type',
        notNull: true,
        default: 'TEAM',
      },
      status: { type: 'text', default: 'ACTIVE' },
      business_reference: { type: 'varchar(255)' },
    },
    { ifNotExists: true },
  );

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE company_user
        ADD CONSTRAINT company_user_company_code_fkey
        FOREIGN KEY (company_code) REFERENCES companies(company_code)
        ON UPDATE CASCADE ON DELETE RESTRICT;
    EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL;
    END $$;
  `);

  pgm.sql(
    'CREATE UNIQUE INDEX IF NOT EXISTS company_user_email_key ON company_user (email)',
  );
  pgm.createIndex('company_user', 'company_code', {
    name: 'idx_company_user_company_code',
    ifNotExists: true,
  });
  pgm.sql(
    'CREATE UNIQUE INDEX IF NOT EXISTS company_user_phone_key ON company_user (phone)',
  );
  pgm.sql(`
    CREATE INDEX IF NOT EXISTS company_user_email_active_idx
      ON company_user (email)
      WHERE deleted_at IS NULL
  `);
  pgm.sql(`
    CREATE INDEX IF NOT EXISTS idx_company_user_active_status
      ON company_user (status)
      WHERE deleted_at IS NULL
  `);
  pgm.sql(
    'CREATE INDEX IF NOT EXISTS idx_company_user_deleted_at ON company_user (deleted_at)',
  );
  pgm.sql('CREATE INDEX IF NOT EXISTS idx_company_user_id ON company_user (id)');
  pgm.createIndex('company_user', 'user_entity_type', {
    name: 'idx_company_user_user_entity_type',
    ifNotExists: true,
  });
};

exports.down = (pgm) => {
  pgm.sql('DROP INDEX IF EXISTS idx_company_user_user_entity_type');
  pgm.sql('DROP INDEX IF EXISTS idx_company_user_id');
  pgm.sql('DROP INDEX IF EXISTS idx_company_user_deleted_at');
  pgm.sql('DROP INDEX IF EXISTS idx_company_user_active_status');
  pgm.sql('DROP INDEX IF EXISTS idx_company_user_company_code');
  pgm.sql('DROP INDEX IF EXISTS company_user_email_active_idx');
  pgm.sql('DROP INDEX IF EXISTS company_user_phone_key');
  pgm.sql('DROP INDEX IF EXISTS company_user_email_key');
  pgm.dropTable('company_user', { ifExists: true, cascade: true });
};
