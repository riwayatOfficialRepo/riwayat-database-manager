exports.up = (pgm) => {
  pgm.sql(`
    CREATE OR REPLACE FUNCTION update_feedback_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  pgm.createTable(
    'feedback',
    {
      id: {
        type: 'uuid',
        primaryKey: true,
        default: pgm.func('gen_random_uuid()'),
        notNull: true,
      },
      customer_id:                    { type: 'uuid' },
      kitchen_id:                     { type: 'uuid' },
      order_id:                       { type: 'uuid' },
      feedback_business_reference:    { type: 'varchar(50)' },
      customer_business_reference:    { type: 'varchar(255)' },
      kitchen_business_reference:     { type: 'varchar(255)' },
      order_business_reference:       { type: 'varchar(255)' },
      customer_name:                  { type: 'varchar(255)' },
      kitchen_name:                   { type: 'varchar(255)' },
      order_name:                     { type: 'varchar(255)' },
      feedback_type:                  { type: 'varchar(50)' },
      feedback_rating:                { type: 'numeric(2,1)' },
      customer_comments:              { type: 'text' },
      customer_final_comments:        { type: 'text' },
      is_media_uploaded:              { type: 'boolean',     default: false },
      feedback_badge:                 { type: 'jsonb' },
      raised_case_types:              { type: 'jsonb',       default: "'[]'" },
      status:                         { type: 'varchar(50)' },
      to_be_published_date:           { type: 'date' },
      published_date:                 { type: 'timestamptz' },
      is_edited_by_admin:             { type: 'boolean',     default: false },
      rejected_reason:                { type: 'varchar(50)' },
      admin_comments:                 { type: 'text' },
      kitchen_comments:               { type: 'text' },
      sent_to_kitchen_date:           { type: 'timestamp' },
      kitchen_responded_date:         { type: 'timestamp' },
      extension_request_count:        { type: 'integer',     default: 0 },
      extension_request_date:         { type: 'timestamp' },
      created_at:                     { type: 'timestamptz', default: pgm.func('now()') },
      updated_at:                     { type: 'timestamptz', default: pgm.func('now()') },
      deleted_at:                     { type: 'timestamptz' },
    },
    { ifNotExists: true },
  );

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE feedback
        ADD CONSTRAINT feedback_feedback_type_check
        CHECK (feedback_type = ANY (ARRAY['Preorder', 'Postorder']));
    EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL;
    END $$;
  `);

  pgm.sql(`
    CREATE OR REPLACE TRIGGER trg_update_feedback
      BEFORE UPDATE ON feedback
      FOR EACH ROW
      EXECUTE FUNCTION update_feedback_updated_at();
  `);
};

exports.down = (pgm) => {
  pgm.sql(`DROP TRIGGER IF EXISTS trg_update_feedback ON feedback`);
  pgm.dropTable('feedback', { ifExists: true, cascade: true });
  pgm.sql(`DROP FUNCTION IF EXISTS update_feedback_updated_at()`);
};
