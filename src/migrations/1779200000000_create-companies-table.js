/**
 * Corporate companies table (portal / corporate management).
 */

exports.up = (pgm) => {
  pgm.sql(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'company_status_enum') THEN
        CREATE TYPE company_status_enum AS ENUM ('active', 'inactive');
      END IF;
    END $$;
  `);

  pgm.createTable(
    'companies',
    {
      id: {
        type: 'uuid',
        primaryKey: true,
        default: pgm.func('gen_random_uuid()'),
      },
      company_code: { type: 'varchar(50)', notNull: true, unique: true },
      name: { type: 'varchar(255)', notNull: true },
      primary_email: { type: 'varchar(255)' },
      primary_phone: { type: 'varchar(50)' },
      primary_contact_name: { type: 'varchar(255)' },
      website: { type: 'varchar(500)' },
      tax_id: { type: 'varchar(100)' },
      status: {
        type: 'company_status_enum',
        notNull: true,
        default: 'active',
      },
      created_at: {
        type: 'timestamptz',
        notNull: true,
        default: pgm.func('now()'),
      },
      updated_at: {
        type: 'timestamptz',
        notNull: true,
        default: pgm.func('now()'),
      },
    },
    { ifNotExists: true },
  );

  pgm.createIndex('companies', 'status', {
    name: 'idx_companies_status',
    ifNotExists: true,
  });
  pgm.createIndex('companies', 'company_code', {
    name: 'idx_companies_company_code',
    ifNotExists: true,
  });
};

exports.down = (pgm) => {
  pgm.dropTable('companies', { ifExists: true, cascade: true });
  pgm.sql('DROP TYPE IF EXISTS company_status_enum');
};
