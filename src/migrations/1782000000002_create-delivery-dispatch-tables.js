/**
 * Delivery dispatch domain — dl_ride, dl_delivery, dl_ride_offer,
 * dl_delivery_offer, dl_unassigned_pool, dl_pool_activity.
 *
 * Column sets mirror the EXISTING models in riwayat-delivery-management-module
 * (src/models/{rides,deliveries,pool}) — the models are the source of truth.
 * dl_pool_activity has no model yet (a poolActivityModel.js should be added).
 *
 * Same-domain links use real FKs; cross-domain links (kitchen/customer/order/
 * fulfillment) are soft uuid refs. Statuses are text + guarded CHECK constraints.
 *
 * Created in dependency order: dl_ride first (referenced by the rest).
 */

const ts = { type: "timestamptz" }; // nullable timestamp (reused by reference — read-only)

exports.up = (pgm) => {
  const now = () => pgm.func("now()");
  const uuid = () => pgm.func("gen_random_uuid()");
  const emptyJson = () => pgm.func(`'{}'::jsonb`);
  const auditCols = {
    created_at: { type: "timestamptz", notNull: true, default: now() },
    updated_at: { type: "timestamptz", notNull: true, default: now() },
  };

  // ── dl_ride ─────────────────────────────────────────────────────
  pgm.createTable(
    "dl_ride",
    {
      ride_id: { type: "uuid", primaryKey: true, default: uuid() },
      business_reference: { type: "text", notNull: true, unique: true },
      delivery_company_id: { type: "uuid" },
      rider_id: { type: "uuid" },
      pickup_kitchen_id: { type: "uuid" }, // SOFT ref -> kitchens(id)
      status: { type: "text", notNull: true, default: "open" },
      current_status: { type: "text" },
      assignment_type: { type: "text" }, // AUTO_DISPATCH | MANUAL_ASSIGNMENT
      total_payout_amount: { type: "numeric" },
      total_cod_amount: { type: "numeric" },
      delivery_count: { type: "integer", notNull: true, default: 0 },
      initial_sequence: { type: "jsonb" },
      rider_details: { type: "jsonb" },
      sla_details: { type: "jsonb" },
      route_details: { type: "jsonb" },
      offered_at: ts,
      accepted_at: ts,
      accepted_details: { type: "jsonb" },
      started_at: ts,
      started_details: { type: "jsonb" },
      completed_at: ts,
      completed_details: { type: "jsonb" },
      cancelled_at: ts,
      cancellation_details: { type: "jsonb" },
      kitchen_details: { type: "jsonb" },
      company_details: { type: "jsonb" },
      pickup_address: { type: "jsonb" },
      manual_assignment_details: { type: "jsonb" },
      is_pickup_location_overridden: { type: "boolean", notNull: true, default: false },
      pickup_override_details: { type: "jsonb" },
      reassignment_count: { type: "integer", notNull: true, default: 0 },
      reassignment_details: { type: "jsonb" },
      metadata: { type: "jsonb", default: emptyJson() },
      ...auditCols,
      deleted_at: ts,
    },
    { ifNotExists: true },
  );

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE dl_ride ADD CONSTRAINT dl_ride_status_check
        CHECK (status IN ('open','accepted','started','completed','cancelled'));
    EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;
  `);
  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE dl_ride ADD CONSTRAINT dl_ride_company_fkey
        FOREIGN KEY (delivery_company_id) REFERENCES delivery_company(delivery_company_id) ON DELETE SET NULL;
    EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;
  `);
  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE dl_ride ADD CONSTRAINT dl_ride_rider_fkey
        FOREIGN KEY (rider_id) REFERENCES riders(rider_id) ON DELETE SET NULL;
    EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;
  `);
  pgm.createIndex("dl_ride", "delivery_company_id", { name: "idx_dl_ride_company", ifNotExists: true });
  pgm.createIndex("dl_ride", "rider_id", { name: "idx_dl_ride_rider", ifNotExists: true });
  pgm.createIndex("dl_ride", "pickup_kitchen_id", { name: "idx_dl_ride_kitchen", ifNotExists: true });
  pgm.createIndex("dl_ride", "status", { name: "idx_dl_ride_status", ifNotExists: true });

  // ── dl_delivery ─────────────────────────────────────────────────
  pgm.createTable(
    "dl_delivery",
    {
      delivery_id: { type: "uuid", primaryKey: true, default: uuid() },
      business_reference: { type: "text", notNull: true, unique: true },
      delivery_company_id: { type: "uuid" },
      rider_id: { type: "uuid" },
      ride_id: { type: "uuid" },
      stop_sequence: { type: "integer" },
      fulfillment_id: { type: "uuid" }, // SOFT ref -> order_fulfillments
      order_id: { type: "uuid" }, // SOFT ref -> orders
      kitchen_id: { type: "uuid" }, // SOFT ref -> kitchens(id)
      customer_id: { type: "uuid" }, // SOFT ref -> customer(id)
      status: { type: "text", notNull: true, default: "created" },
      fulfillment_mode: { type: "text" },
      ride_details: { type: "jsonb" },
      company_details: { type: "jsonb" },
      order_details: { type: "jsonb" },
      fulfillment_details: { type: "jsonb" },
      kitchen_details: { type: "jsonb" },
      customer_details: { type: "jsonb" },
      rider_details: { type: "jsonb" },
      pickup_address: { type: "jsonb" },
      cod_amount: { type: "numeric" },
      cod_collection_details: { type: "jsonb" },
      total_payout_amount: { type: "numeric" },
      offer_accepted_at: ts,
      offer_accepted_details: { type: "jsonb" },
      assigned_at: ts,
      assigned_details: { type: "jsonb" },
      picked_up_at: ts,
      pickup_details: { type: "jsonb" },
      delivered_at: ts,
      delivery_details: { type: "jsonb" },
      failed_at: ts,
      failure_details: { type: "jsonb" },
      cancelled_at: ts,
      cancellation_details: { type: "jsonb" },
      is_pickup_location_overridden: { type: "boolean", notNull: true, default: false },
      pickup_override_details: { type: "jsonb" },
      metadata: { type: "jsonb", default: emptyJson() },
      ...auditCols,
      deleted_at: ts,
    },
    { ifNotExists: true },
  );

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE dl_delivery ADD CONSTRAINT dl_delivery_status_check
        CHECK (status IN ('created','offerable','assigned','arrived_pickup','picked_up','arrived_dropoff','delivered','failed','cancelled'));
    EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;
  `);
  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE dl_delivery ADD CONSTRAINT dl_delivery_company_fkey
        FOREIGN KEY (delivery_company_id) REFERENCES delivery_company(delivery_company_id) ON DELETE SET NULL;
    EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;
  `);
  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE dl_delivery ADD CONSTRAINT dl_delivery_rider_fkey
        FOREIGN KEY (rider_id) REFERENCES riders(rider_id) ON DELETE SET NULL;
    EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;
  `);
  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE dl_delivery ADD CONSTRAINT dl_delivery_ride_fkey
        FOREIGN KEY (ride_id) REFERENCES dl_ride(ride_id) ON DELETE SET NULL;
    EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;
  `);
  pgm.createIndex("dl_delivery", "ride_id", { name: "idx_dl_delivery_ride", ifNotExists: true });
  pgm.createIndex("dl_delivery", "rider_id", { name: "idx_dl_delivery_rider", ifNotExists: true });
  pgm.createIndex("dl_delivery", "delivery_company_id", { name: "idx_dl_delivery_company", ifNotExists: true });
  pgm.createIndex("dl_delivery", "fulfillment_id", { name: "idx_dl_delivery_fulfillment", ifNotExists: true });
  pgm.createIndex("dl_delivery", "kitchen_id", { name: "idx_dl_delivery_kitchen", ifNotExists: true });
  pgm.createIndex("dl_delivery", "status", { name: "idx_dl_delivery_status", ifNotExists: true });

  // ── dl_ride_offer ───────────────────────────────────────────────
  pgm.createTable(
    "dl_ride_offer",
    {
      ride_offer_id: { type: "uuid", primaryKey: true, default: uuid() },
      business_reference: { type: "text", notNull: true, unique: true },
      ride_id: { type: "uuid", notNull: true },
      rider_id: { type: "uuid", notNull: true },
      status: { type: "text", notNull: true, default: "pending" },
      attempt_number: { type: "integer", notNull: true, default: 1 },
      offered_reason: { type: "text" }, // AUTO_DISPATCH | MANUAL_ASSIGNMENT
      offered_at: ts,
      offered_details: { type: "jsonb" },
      expires_at: ts,
      responded_at: ts,
      response_details: { type: "jsonb" },
      rejection_details: { type: "jsonb" },
      metadata: { type: "jsonb", default: emptyJson() },
      ...auditCols,
    },
    { ifNotExists: true },
  );

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE dl_ride_offer ADD CONSTRAINT dl_ride_offer_status_check
        CHECK (status IN ('pending','accepted','rejected','expired'));
    EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;
  `);
  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE dl_ride_offer ADD CONSTRAINT dl_ride_offer_ride_fkey
        FOREIGN KEY (ride_id) REFERENCES dl_ride(ride_id) ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;
  `);
  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE dl_ride_offer ADD CONSTRAINT dl_ride_offer_rider_fkey
        FOREIGN KEY (rider_id) REFERENCES riders(rider_id) ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;
  `);
  pgm.createIndex("dl_ride_offer", "ride_id", { name: "idx_dl_ride_offer_ride", ifNotExists: true });
  pgm.createIndex("dl_ride_offer", "rider_id", { name: "idx_dl_ride_offer_rider", ifNotExists: true });
  pgm.createIndex("dl_ride_offer", "status", { name: "idx_dl_ride_offer_status", ifNotExists: true });
  // supports the reconciliation sweep: pending offers past expiry
  pgm.createIndex("dl_ride_offer", ["status", "expires_at"], {
    name: "idx_dl_ride_offer_status_expires",
    ifNotExists: true,
  });

  // ── dl_delivery_offer ───────────────────────────────────────────
  pgm.createTable(
    "dl_delivery_offer",
    {
      delivery_offer_id: { type: "uuid", primaryKey: true, default: uuid() },
      business_reference: { type: "text", notNull: true, unique: true },
      delivery_id: { type: "uuid", notNull: true },
      delivery_details: { type: "jsonb" },
      ride_id: { type: "uuid", notNull: true },
      ride_details: { type: "jsonb" },
      ride_offer_id: { type: "uuid" }, // null for PATH A / EXISTING_RIDE
      ride_offer_details: { type: "jsonb" },
      rider_id: { type: "uuid" },
      rider_details: { type: "jsonb" },
      status: { type: "text", notNull: true, default: "pending" },
      offer_context: { type: "text" }, // EXISTING_RIDE | NEW_RIDE
      attempt_number: { type: "integer", notNull: true, default: 1 },
      offered_reason: { type: "text" }, // AUTO_DISPATCH | MANUAL_ASSIGNMENT
      is_cod_collection: { type: "boolean", notNull: true, default: false },
      offered_at: ts,
      offered_details: { type: "jsonb" },
      expires_at: ts,
      responded_at: ts,
      response_details: { type: "jsonb" },
      rejection_details: { type: "jsonb" },
      metadata: { type: "jsonb", default: emptyJson() },
      ...auditCols,
    },
    { ifNotExists: true },
  );

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE dl_delivery_offer ADD CONSTRAINT dl_delivery_offer_status_check
        CHECK (status IN ('pending','accepted','rejected','expired'));
    EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;
  `);
  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE dl_delivery_offer ADD CONSTRAINT dl_delivery_offer_context_check
        CHECK (offer_context IS NULL OR offer_context IN ('EXISTING_RIDE','NEW_RIDE'));
    EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;
  `);
  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE dl_delivery_offer ADD CONSTRAINT dl_delivery_offer_delivery_fkey
        FOREIGN KEY (delivery_id) REFERENCES dl_delivery(delivery_id) ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;
  `);
  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE dl_delivery_offer ADD CONSTRAINT dl_delivery_offer_ride_fkey
        FOREIGN KEY (ride_id) REFERENCES dl_ride(ride_id) ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;
  `);
  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE dl_delivery_offer ADD CONSTRAINT dl_delivery_offer_ride_offer_fkey
        FOREIGN KEY (ride_offer_id) REFERENCES dl_ride_offer(ride_offer_id) ON DELETE SET NULL;
    EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;
  `);
  pgm.createIndex("dl_delivery_offer", "delivery_id", { name: "idx_dl_delivery_offer_delivery", ifNotExists: true });
  pgm.createIndex("dl_delivery_offer", "ride_id", { name: "idx_dl_delivery_offer_ride", ifNotExists: true });
  pgm.createIndex("dl_delivery_offer", "ride_offer_id", { name: "idx_dl_delivery_offer_ride_offer", ifNotExists: true });
  pgm.createIndex("dl_delivery_offer", "status", { name: "idx_dl_delivery_offer_status", ifNotExists: true });
  pgm.createIndex("dl_delivery_offer", ["status", "expires_at"], {
    name: "idx_dl_delivery_offer_status_expires",
    ifNotExists: true,
  });

  // ── dl_unassigned_pool ──────────────────────────────────────────
  pgm.createTable(
    "dl_unassigned_pool",
    {
      pool_id: { type: "uuid", primaryKey: true, default: uuid() },
      pool_reference: { type: "text", notNull: true, unique: true },
      ride_id: { type: "uuid", notNull: true },
      pool_reason: { type: "text" },
      status: { type: "text", notNull: true, default: "AVAILABLE" },
      upfront_message: { type: "text" },
      ride_in_pool_at: ts,
      ride_in_pool_by: { type: "text" },
      ride_in_pool_details: { type: "jsonb" },
      escalation_status: { type: "text" }, // ESCALATED or null (orthogonal flag)
      escalated_at: ts,
      escalated_by_details: { type: "jsonb" },
      metadata: { type: "jsonb", default: emptyJson() },
      ...auditCols,
    },
    { ifNotExists: true },
  );

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE dl_unassigned_pool ADD CONSTRAINT dl_unassigned_pool_status_check
        CHECK (status IN ('AVAILABLE','OFFER_PENDING','CLAIMED'));
    EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;
  `);
  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE dl_unassigned_pool ADD CONSTRAINT dl_unassigned_pool_reason_check
        CHECK (pool_reason IS NULL OR pool_reason IN ('AUTO_DISPATCH_EXHAUSTED','RIDE_CANCELLED_REPOOLED','MANUALLY_POOLED'));
    EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;
  `);
  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE dl_unassigned_pool ADD CONSTRAINT dl_unassigned_pool_ride_fkey
        FOREIGN KEY (ride_id) REFERENCES dl_ride(ride_id) ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;
  `);
  pgm.createIndex("dl_unassigned_pool", "ride_id", { name: "idx_dl_unassigned_pool_ride", ifNotExists: true });
  pgm.createIndex("dl_unassigned_pool", "status", { name: "idx_dl_unassigned_pool_status", ifNotExists: true });
  pgm.createIndex("dl_unassigned_pool", "escalation_status", { name: "idx_dl_unassigned_pool_escalation", ifNotExists: true });

  // ── dl_pool_activity (audit trail; no model yet) ────────────────
  pgm.createTable(
    "dl_pool_activity",
    {
      activity_id: { type: "uuid", primaryKey: true, default: uuid() },
      business_reference: { type: "text", notNull: true, unique: true },
      pool_id: { type: "uuid", notNull: true },
      ride_id: { type: "uuid" },
      action: { type: "text" }, // VIEWED | OFFERED | ACCEPTED | REJECTED | ESCALATED
      company_id: { type: "uuid" },
      user_id: { type: "uuid" },
      details: { type: "jsonb", default: emptyJson() },
      created_at: { type: "timestamptz", notNull: true, default: now() },
    },
    { ifNotExists: true },
  );

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE dl_pool_activity ADD CONSTRAINT dl_pool_activity_action_check
        CHECK (action IS NULL OR action IN ('VIEWED','OFFERED','ACCEPTED','REJECTED','ESCALATED'));
    EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;
  `);
  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE dl_pool_activity ADD CONSTRAINT dl_pool_activity_pool_fkey
        FOREIGN KEY (pool_id) REFERENCES dl_unassigned_pool(pool_id) ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;
  `);
  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE dl_pool_activity ADD CONSTRAINT dl_pool_activity_ride_fkey
        FOREIGN KEY (ride_id) REFERENCES dl_ride(ride_id) ON DELETE SET NULL;
    EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;
  `);
  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE dl_pool_activity ADD CONSTRAINT dl_pool_activity_company_fkey
        FOREIGN KEY (company_id) REFERENCES delivery_company(delivery_company_id) ON DELETE SET NULL;
    EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;
  `);
  pgm.createIndex("dl_pool_activity", "pool_id", { name: "idx_dl_pool_activity_pool", ifNotExists: true });
  pgm.createIndex("dl_pool_activity", "ride_id", { name: "idx_dl_pool_activity_ride", ifNotExists: true });
  pgm.createIndex("dl_pool_activity", "company_id", { name: "idx_dl_pool_activity_company", ifNotExists: true });
};

exports.down = (pgm) => {
  pgm.dropTable("dl_pool_activity", { ifExists: true, cascade: true });
  pgm.dropTable("dl_unassigned_pool", { ifExists: true, cascade: true });
  pgm.dropTable("dl_delivery_offer", { ifExists: true, cascade: true });
  pgm.dropTable("dl_ride_offer", { ifExists: true, cascade: true });
  pgm.dropTable("dl_delivery", { ifExists: true, cascade: true });
  pgm.dropTable("dl_ride", { ifExists: true, cascade: true });
};
