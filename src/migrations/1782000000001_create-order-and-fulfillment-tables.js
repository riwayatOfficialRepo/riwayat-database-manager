/**
 * Order domain — orders + order_fulfillments.
 *
 * Part of the delivery dispatch workflow. These tables are owned by
 * the order-manager service but live in the shared platform DB.
 *
 * Cross-domain links (order_fulfillments.delivery_id -> dl_delivery) are kept as
 * SOFT references (plain uuid, no FK) to decouple the order and delivery domains.
 * Same-domain link (order_fulfillments.order_id -> orders) is a real FK.
 *
 * Column names use snake_case; statuses are text + guarded CHECK constraints,
 * matching the repo convention (see 1773800000001_create-rider-delivery-ecosystem-tables.js).
 */

exports.up = (pgm) => {
  // ── orders ──────────────────────────────────────────────────────
  pgm.createTable(
    "orders",
    {
      order_id: {
        type: "uuid",
        primaryKey: true,
        default: pgm.func("gen_random_uuid()"),
      },
      business_reference: { type: "text", notNull: true, unique: true },
      customer_id: { type: "uuid" }, // SOFT ref -> customer(id)
      kitchen_id: { type: "uuid" }, // SOFT ref -> kitchens(id)
      status: { type: "text", notNull: true, default: "scheduled" },
      total_amount: { type: "numeric" },
      cod_amount: { type: "numeric" },
      metadata: { type: "jsonb", default: pgm.func(`'{}'::jsonb`) },
      created_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
      updated_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
      deleted_at: { type: "timestamptz" },
    },
    { ifNotExists: true },
  );

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE orders ADD CONSTRAINT orders_status_check
        CHECK (status IN ('scheduled','confirmed','ready','delivery_created','completed','cancelled'));
    EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL;
    END $$;
  `);

  pgm.createIndex("orders", "customer_id", { name: "idx_orders_customer", ifNotExists: true });
  pgm.createIndex("orders", "kitchen_id", { name: "idx_orders_kitchen", ifNotExists: true });
  pgm.createIndex("orders", "status", { name: "idx_orders_status", ifNotExists: true });

  // ── order_fulfillments ──────────────────────────────────────────
  pgm.createTable(
    "order_fulfillments",
    {
      fulfillment_id: {
        type: "uuid",
        primaryKey: true,
        default: pgm.func("gen_random_uuid()"),
      },
      business_reference: { type: "text", notNull: true, unique: true },
      order_id: { type: "uuid", notNull: true }, // real FK -> orders (same domain)
      status: { type: "text", notNull: true, default: "scheduled" },
      fulfillment_mode: { type: "text", notNull: true, default: "standard" },
      fulfillment_details: { type: "jsonb", default: pgm.func(`'{}'::jsonb`) },
      delivery_id: { type: "uuid" }, // SOFT ref -> dl_delivery (cross-domain, no FK)
      ready_at: { type: "timestamptz" },
      delivery_created_at: { type: "timestamptz" },
      metadata: { type: "jsonb", default: pgm.func(`'{}'::jsonb`) },
      created_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
      updated_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
      deleted_at: { type: "timestamptz" },
    },
    { ifNotExists: true },
  );

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE order_fulfillments ADD CONSTRAINT order_fulfillments_status_check
        CHECK (status IN ('scheduled','ready','delivery_created','cancelled'));
    EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL;
    END $$;
  `);

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE order_fulfillments
        ADD CONSTRAINT order_fulfillments_order_fkey
        FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL;
    END $$;
  `);

  pgm.createIndex("order_fulfillments", "order_id", {
    name: "idx_order_fulfillments_order",
    ifNotExists: true,
  });
  pgm.createIndex("order_fulfillments", "status", {
    name: "idx_order_fulfillments_status",
    ifNotExists: true,
  });
  pgm.createIndex("order_fulfillments", "delivery_id", {
    name: "idx_order_fulfillments_delivery",
    ifNotExists: true,
  });
};

exports.down = (pgm) => {
  pgm.dropTable("order_fulfillments", { ifExists: true, cascade: true });
  pgm.dropTable("orders", { ifExists: true, cascade: true });
};
