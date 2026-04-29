/**
 * Rider + delivery company ecosystem.
 *
 * Tables: delivery_company, delivery_company_users, riders, rider_auth,
 * rider_presence, rider_media, rider_vehicle, rider_documents, rider_prospects
 *
 * Column names use snake_case in PostgreSQL (e.g. mobile_number).
 */

exports.up = (pgm) => {
  // gen_random_uuid() is available in PostgreSQL 13+ without extensions.

  // ── 1. delivery_company ─────────────────────────────────────────
  pgm.createTable(
    "delivery_company",
    {
      delivery_company_id: {
        type: "uuid",
        primaryKey: true,
        default: pgm.func("gen_random_uuid()"),
      },
      company_ref: { type: "text", notNull: true, unique: true },
      name: { type: "text", notNull: true },
      status: { type: "text", notNull: true, default: "active" },
      primary_contact_name: { type: "text" },
      primary_contact_phone: { type: "text" },
      primary_contact_email: { type: "text" },
      service_areas: { type: "jsonb", default: pgm.func(`'[]'::jsonb`) },
      sla_config: { type: "jsonb", default: pgm.func(`'{}'::jsonb`) },
      settlement_config: { type: "jsonb", default: pgm.func(`'{}'::jsonb`) },
      contract_start_date: { type: "date" },
      contract_end_date: { type: "date" },
      bank_account_detail: { type: "jsonb", default: pgm.func(`'{}'::jsonb`) },
      notes: { type: "text" },
      metadata: { type: "jsonb", default: pgm.func(`'{}'::jsonb`) },
      created_at: {
        type: "timestamptz",
        notNull: true,
        default: pgm.func("now()"),
      },
      updated_at: {
        type: "timestamptz",
        notNull: true,
        default: pgm.func("now()"),
      },
      created_by: { type: "uuid" },
    },
    { ifNotExists: true },
  );

  // ── 2. delivery_company_users ───────────────────────────────────
  pgm.createTable(
    "delivery_company_users",
    {
      delivery_company_user_id: {
        type: "uuid",
        primaryKey: true,
        default: pgm.func("gen_random_uuid()"),
      },
      user_ref: { type: "text", notNull: true, unique: true },
      delivery_company_id: { type: "uuid", notNull: true },
      full_name: { type: "text" },
      mobile_number: { type: "text" },
      is_mobile_verified: { type: "boolean", notNull: true, default: false },
      email: { type: "text" },
      is_email_verified: { type: "boolean", notNull: true, default: false },
      role: { type: "text" },
      status: { type: "text", notNull: true, default: "active" },
      pin_hash: { type: "text" },
      pin_set_at: { type: "timestamptz" },
      failed_pin_attempts: { type: "integer", notNull: true, default: 0 },
      pin_blocked_until: { type: "timestamptz" },
      invited_at: { type: "timestamptz" },
      invited_by: { type: "uuid" },
      last_login_at: { type: "timestamptz" },
      metadata: { type: "jsonb", default: pgm.func(`'{}'::jsonb`) },
      created_at: {
        type: "timestamptz",
        notNull: true,
        default: pgm.func("now()"),
      },
      updated_at: {
        type: "timestamptz",
        notNull: true,
        default: pgm.func("now()"),
      },
      created_by: { type: "uuid" },
    },
    { ifNotExists: true },
  );

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE delivery_company_users
        ADD CONSTRAINT delivery_company_users_company_fkey
        FOREIGN KEY (delivery_company_id) REFERENCES delivery_company(delivery_company_id) ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  pgm.createIndex("delivery_company_users", "delivery_company_id", {
    name: "idx_delivery_company_users_company",
    ifNotExists: true,
  });

  // ── 3. riders ────────────────────────────────────────────────────
  pgm.createTable(
    "riders",
    {
      rider_id: {
        type: "uuid",
        primaryKey: true,
        default: pgm.func("gen_random_uuid()"),
      },
      rider_ref: { type: "text", notNull: true, unique: true },
      delivery_company_id: { type: "uuid" },
      full_name: { type: "text" },
      primary_mobile: { type: "text", notNull: true, unique: true },
      is_primary_mobile_verified: {
        type: "boolean",
        notNull: true,
        default: false,
      },
      secondary_mobile: { type: "text" },
      email: { type: "text" },
      status: {
        type: "text",
        notNull: true,
        default: "pending",
      },
      notes: { type: "text" },
      metadata: { type: "jsonb", default: pgm.func(`'{}'::jsonb`) },
      created_at: {
        type: "timestamptz",
        notNull: true,
        default: pgm.func("now()"),
      },
      updated_at: {
        type: "timestamptz",
        notNull: true,
        default: pgm.func("now()"),
      },
      created_by: { type: "uuid" },
    },
    { ifNotExists: true },
  );

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE riders ADD CONSTRAINT riders_status_check
        CHECK (status IN ('pending', 'active', 'suspended', 'rejected', 'disabled'));
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE riders
        ADD CONSTRAINT riders_delivery_company_fkey
        FOREIGN KEY (delivery_company_id) REFERENCES delivery_company(delivery_company_id) ON DELETE SET NULL;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  pgm.createIndex("riders", "primary_mobile", {
    name: "idx_riders_primary_mobile",
    ifNotExists: true,
  });
  pgm.createIndex("riders", "status", {
    name: "idx_riders_status",
    ifNotExists: true,
  });
  pgm.createIndex("riders", "delivery_company_id", {
    name: "idx_riders_delivery_company",
    ifNotExists: true,
  });

  // ── 4. rider_auth ───────────────────────────────────────────────
  pgm.createTable(
    "rider_auth",
    {
      rider_auth_id: {
        type: "uuid",
        primaryKey: true,
        default: pgm.func("gen_random_uuid()"),
      },
      rider_id: { type: "uuid", notNull: true, unique: true },
      pin_hash: { type: "text" },
      pin_set_at: { type: "timestamptz" },
      failed_pin_attempts: { type: "integer", notNull: true, default: 0 },
      pin_blocked_until: { type: "timestamptz" },
      last_login_at: { type: "timestamptz" },
      last_login_ip: { type: "inet" },
      last_device_id: { type: "text" },
      metadata: { type: "jsonb", default: pgm.func(`'{}'::jsonb`) },
      created_at: {
        type: "timestamptz",
        notNull: true,
        default: pgm.func("now()"),
      },
      updated_at: {
        type: "timestamptz",
        notNull: true,
        default: pgm.func("now()"),
      },
    },
    { ifNotExists: true },
  );

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE rider_auth
        ADD CONSTRAINT rider_auth_rider_fkey
        FOREIGN KEY (rider_id) REFERENCES riders(rider_id) ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  pgm.createIndex("rider_auth", "rider_id", {
    name: "idx_rider_auth_rider_id",
    ifNotExists: true,
  });

  // ── 5. rider_presence ───────────────────────────────────────────
  pgm.createTable(
    "rider_presence",
    {
      rider_presence_id: {
        type: "uuid",
        primaryKey: true,
        default: pgm.func("gen_random_uuid()"),
      },
      rider_id: { type: "uuid", notNull: true, unique: true },
      availability_status: { type: "text", default: "offline" },
      last_online_at: { type: "timestamptz" },
      last_offline_at: { type: "timestamptz" },
      last_seen_at: { type: "timestamptz" },
      offline_reason: { type: "text" },
      last_known_zone: { type: "text" },
      active_ride_count: { type: "integer", notNull: true, default: 0 },
      metadata: { type: "jsonb", default: pgm.func(`'{}'::jsonb`) },
      created_at: {
        type: "timestamptz",
        notNull: true,
        default: pgm.func("now()"),
      },
      updated_at: {
        type: "timestamptz",
        notNull: true,
        default: pgm.func("now()"),
      },
    },
    { ifNotExists: true },
  );

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE rider_presence
        ADD CONSTRAINT rider_presence_rider_fkey
        FOREIGN KEY (rider_id) REFERENCES riders(rider_id) ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  // ── 6. rider_media ─────────────────────────────────────────────
  pgm.createTable(
    "rider_media",
    {
      media_id: {
        type: "uuid",
        primaryKey: true,
        default: pgm.func("gen_random_uuid()"),
      },
      rider_id: { type: "uuid", notNull: true },
      media_type: { type: "text", notNull: true },
      s3_url: { type: "text" },
      status: { type: "text", notNull: true, default: "pending" },
      verified_by: { type: "uuid" },
      notes: { type: "text" },
      created_at: {
        type: "timestamptz",
        notNull: true,
        default: pgm.func("now()"),
      },
      updated_at: {
        type: "timestamptz",
        notNull: true,
        default: pgm.func("now()"),
      },
      created_by: { type: "uuid" },
    },
    { ifNotExists: true },
  );

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE rider_media
        ADD CONSTRAINT rider_media_rider_fkey
        FOREIGN KEY (rider_id) REFERENCES riders(rider_id) ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  pgm.createIndex("rider_media", "rider_id", {
    name: "idx_rider_media_rider",
    ifNotExists: true,
  });

  // ── 7. rider_vehicle ───────────────────────────────────────────
  pgm.createTable(
    "rider_vehicle",
    {
      vehicle_id: {
        type: "uuid",
        primaryKey: true,
        default: pgm.func("gen_random_uuid()"),
      },
      vehicle_ref: { type: "text", notNull: true, unique: true },
      rider_id: { type: "uuid", notNull: true },
      vehicle_type: { type: "text" },
      vehicle_number: { type: "text" },
      vehicle_metadata: { type: "jsonb", default: pgm.func(`'{}'::jsonb`) },
      vehicle_verified: { type: "boolean", notNull: true, default: false },
      status: { type: "text", notNull: true, default: "active" },
      verified_by: { type: "uuid" },
      notes: { type: "text" },
      created_at: {
        type: "timestamptz",
        notNull: true,
        default: pgm.func("now()"),
      },
      updated_at: {
        type: "timestamptz",
        notNull: true,
        default: pgm.func("now()"),
      },
      created_by: { type: "uuid" },
    },
    { ifNotExists: true },
  );

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE rider_vehicle
        ADD CONSTRAINT rider_vehicle_rider_fkey
        FOREIGN KEY (rider_id) REFERENCES riders(rider_id) ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  pgm.createIndex("rider_vehicle", "rider_id", {
    name: "idx_rider_vehicle_rider",
    ifNotExists: true,
  });

  // ── 8. rider_documents ─────────────────────────────────────────
  pgm.createTable(
    "rider_documents",
    {
      document_id: {
        type: "uuid",
        primaryKey: true,
        default: pgm.func("gen_random_uuid()"),
      },
      document_ref: { type: "text", notNull: true, unique: true },
      rider_id: { type: "uuid", notNull: true },
      document_type: { type: "text", notNull: true },
      rider_media_id: { type: "uuid" },
      status: { type: "text", notNull: true, default: "pending" },
      verified_by: { type: "uuid" },
      notes: { type: "text" },
      created_at: {
        type: "timestamptz",
        notNull: true,
        default: pgm.func("now()"),
      },
      updated_at: {
        type: "timestamptz",
        notNull: true,
        default: pgm.func("now()"),
      },
      created_by: { type: "uuid" },
    },
    { ifNotExists: true },
  );

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE rider_documents
        ADD CONSTRAINT rider_documents_rider_fkey
        FOREIGN KEY (rider_id) REFERENCES riders(rider_id) ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE rider_documents
        ADD CONSTRAINT rider_documents_media_fkey
        FOREIGN KEY (rider_media_id) REFERENCES rider_media(media_id) ON DELETE SET NULL;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  pgm.createIndex("rider_documents", "rider_id", {
    name: "idx_rider_documents_rider",
    ifNotExists: true,
  });

  // ── 9. rider_prospects (onboarding pipeline; used by rider-service) ─
  pgm.createTable(
    "rider_prospects",
    {
      prospect_id: {
        type: "uuid",
        primaryKey: true,
        default: pgm.func("gen_random_uuid()"),
      },
      entity_id: { type: "uuid" },
      rider_user_id: { type: "uuid" },
      data_provided: { type: "jsonb", default: pgm.func(`'{}'::jsonb`) },
      status: { type: "text", notNull: true, default: "INITIATED" },
      created_by: { type: "uuid" },
      created_at: {
        type: "timestamptz",
        notNull: true,
        default: pgm.func("now()"),
      },
      last_updated: {
        type: "timestamptz",
        notNull: true,
        default: pgm.func("now()"),
      },
    },
    { ifNotExists: true },
  );

  pgm.createIndex("rider_prospects", "entity_id", {
    name: "idx_rider_prospects_entity",
    ifNotExists: true,
  });
  pgm.createIndex("rider_prospects", "rider_user_id", {
    name: "idx_rider_prospects_rider_user",
    ifNotExists: true,
  });
};

exports.down = (pgm) => {
  pgm.dropTable("rider_prospects", { ifExists: true, cascade: true });
  pgm.dropTable("rider_documents", { ifExists: true, cascade: true });
  pgm.dropTable("rider_vehicle", { ifExists: true, cascade: true });
  pgm.dropTable("rider_media", { ifExists: true, cascade: true });
  pgm.dropTable("rider_presence", { ifExists: true, cascade: true });
  pgm.dropTable("rider_auth", { ifExists: true, cascade: true });
  pgm.dropTable("riders", { ifExists: true, cascade: true });
  pgm.dropTable("delivery_company_users", { ifExists: true, cascade: true });
  pgm.dropTable("delivery_company", { ifExists: true, cascade: true });
};
