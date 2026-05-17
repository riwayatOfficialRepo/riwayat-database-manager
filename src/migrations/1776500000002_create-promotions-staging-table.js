/**
 * Migration: Create promotions_staging table
 */

exports.up = (pgm) => {
  pgm.createTable(
    'promotions_staging',
    {
      id: {
        type: 'uuid',
        primaryKey: true,
        default: pgm.func('gen_random_uuid()'),
        notNull: true,
      },
      promotion_id: { type: 'uuid' },
      campaign_id: { type: 'uuid' },
      name_internal: { type: 'varchar(120)' },
      name_display: { type: 'varchar(180)' },
      campaign_label: { type: 'varchar(80)' },
      promotion_type: { type: 'varchar(50)' },
      application_mode: { type: 'varchar(20)' },
      discount_idea: { type: 'varchar(50)' },
      discount_idea_detail: { type: 'jsonb' },
      percent_value: { type: 'numeric(5,2)' },
      amount_minor: { type: 'bigint' },
      currency_code: { type: 'char(3)', default: 'PKR' },
      max_discount_minor: { type: 'bigint' },
      buy_qty: { type: 'integer' },
      get_qty: { type: 'integer' },
      free_lowest_item: { type: 'boolean' },
      owned_by: { type: 'varchar(20)' },
      owned_kitchen_id: { type: 'uuid' },
      stackable: { type: 'boolean', default: false },
      status: { type: 'varchar(20)', default: 'DRAFT' },
      starts_at: { type: 'timestamptz' },
      ends_at: { type: 'timestamptz' },
      timezone: { type: 'varchar(64)', default: 'Asia/Karachi' },
      usage_limit_per_user: { type: 'integer' },
      usage_limit_total: { type: 'integer' },
      daily_usage_limit: { type: 'integer' },
      max_orders_flashsale: { type: 'integer' },
      customer_message: { type: 'varchar(200)' },
      description_internal: { type: 'text' },
      current_version_no: { type: 'integer', default: 1 },
      business_reference: { type: 'varchar(255)' },
      change_in_progress: { type: 'boolean', notNull: true, default: false },
      created_by: { type: 'uuid' },
      created_at: { type: 'timestamptz', default: pgm.func('now()') },
      updated_at: { type: 'timestamptz', default: pgm.func('now()') },
      deleted_at: { type: 'timestamp' },
    },
    { ifNotExists: true },
  );

  // Unique constraint: name_internal
  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE promotions_staging
        ADD CONSTRAINT promotions_staging_name_internal_key UNIQUE (name_internal);
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  // Unique index: name_display case-insensitive
  pgm.sql(`
    CREATE UNIQUE INDEX IF NOT EXISTS promotions_staging_name_display_ci
      ON promotions_staging USING btree (lower(name_display::text) ASC NULLS LAST);
  `);

  // FK: promotion_id -> promotions (ON DELETE CASCADE)
  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE promotions_staging
        ADD CONSTRAINT promotions_staging_promotion_id_fkey
        FOREIGN KEY (promotion_id) REFERENCES promotions(id)
        ON UPDATE NO ACTION ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);
};

exports.down = (pgm) => {
  pgm.sql(`DROP INDEX IF EXISTS promotions_staging_name_display_ci`);
  pgm.dropTable('promotions_staging', { ifExists: true, cascade: true });
};
