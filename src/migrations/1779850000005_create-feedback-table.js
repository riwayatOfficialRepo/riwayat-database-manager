exports.up = (pgm) => {
  pgm.sql(`
    CREATE TABLE IF NOT EXISTS feedback (
      id                      uuid NOT NULL DEFAULT gen_random_uuid(),
      customer_id             uuid,
      kitchen_id              uuid,
      order_id                uuid,
      customer_business_reference  varchar(255),
      kitchen_business_reference   varchar(255),
      order_business_reference     varchar(255),
      customer_name                varchar(255),
      kitchen_name                 varchar(255),
      order_name                   varchar(255),
      feedback_type           varchar(50),
      feedback_rating         numeric(2,1),
      customer_comments       text,
      customer_final_comments text,
      is_media_uploaded       boolean DEFAULT false,
      feedback_badge          jsonb,
      raised_case_types       jsonb DEFAULT '[]',
      status                  varchar(50),
      to_be_published_date    date,
      published_date          timestamptz,
      is_edited_by_admin      boolean DEFAULT false,
      rejected_reason         varchar(50),
      admin_comments          text,
      kitchen_comments        text,
      sent_to_kitchen_date    timestamp,
      kitchen_responded_date  timestamp,
      extension_request_count integer DEFAULT 0,
      extension_request_date  timestamp,
      created_at              timestamptz DEFAULT now(),
      updated_at              timestamptz DEFAULT now(),
      deleted_at              timestamptz,
      CONSTRAINT feedback_pkey PRIMARY KEY (id),
      CONSTRAINT feedback_feedback_type_check CHECK (
        feedback_type = ANY (ARRAY['Preorder', 'Postorder'])
      )
    );
  `);
};

exports.down = (pgm) => {
  pgm.sql(`DROP TABLE IF EXISTS feedback CASCADE`);
};
