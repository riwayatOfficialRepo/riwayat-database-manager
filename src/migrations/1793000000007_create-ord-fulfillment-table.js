/**
 * Order domain: ord_fulfillment, one scheduled drop of an order; each drop has at most one delivery (delivery_id, dl_ domain, no FK).
 * drop_address_id / drop_address_details are null when the drop goes to the order's drop address.
 */

exports.up = (pgm) => {
  pgm.createTable(
    'ord_fulfillment',
    {
      fulfillment_id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
      fulfillment_reference: { type: 'varchar(25)', notNull: true, unique: true },
      order_id: { type: 'uuid', notNull: true, references: 'ord_order(order_id)' },
      kitchen_id: { type: 'uuid', notNull: true },
      customer_id: { type: 'uuid', notNull: true },
      sequence_no: { type: 'smallint', notNull: true },
      fulfillment_type: { type: 'varchar(20)', notNull: true, check: `fulfillment_type IN ('INSTANT', 'SCHEDULED')` },
      is_custom_date: { type: 'boolean', notNull: true, default: false },
      scheduled_date: { type: 'date' },
      window_start_at: { type: 'timestamptz' },
      window_end_at: { type: 'timestamptz' },
      estimated_ready_at: { type: 'timestamptz' },
      estimated_delivery_at: { type: 'timestamptz' },
      delivery_type: {
        type: 'varchar(20)',
        notNull: true,
        check: `delivery_type IN ('RIWAYAT_DELIVERY', 'SELF_PICKUP', 'KITCHEN_DROP')`,
      },
      drop_address_id: { type: 'uuid' },
      drop_address_details: { type: 'jsonb' },
      fulfillment_status: {
        type: 'varchar(25)',
        notNull: true,
        default: 'SCHEDULED',
        check: `fulfillment_status IN ('SCHEDULED', 'PREPARING', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED', 'SKIPPED', 'CANCELLED')`,
      },
      items_amount: { type: 'integer', notNull: true, default: 0 },
      fees_amount: { type: 'integer', notNull: true, default: 0 },
      total_amount: { type: 'integer', notNull: true, default: 0 },
      delivery_id: { type: 'uuid' }, // null for SELF_PICKUP
      skip_reason: { type: 'varchar(255)' },
      cancelled_by_type: {
        type: 'varchar(20)',
        check: `cancelled_by_type IN ('CUSTOMER', 'KITCHEN', 'ADMIN', 'SYSTEM')`,
      },
      cancelled_by_id: { type: 'uuid' },
      cancelled_by_details: { type: 'jsonb', notNull: true, default: pgm.func(`'{}'::jsonb`) },
      cancellation_reason: { type: 'varchar(255)' },
      preparing_at: { type: 'timestamptz' },
      ready_at: { type: 'timestamptz' },
      dispatched_at: { type: 'timestamptz' },
      fulfilled_at: { type: 'timestamptz' },
      cancelled_at: { type: 'timestamptz' },
      created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
      updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    },
    { ifNotExists: true },
  );
  // Named constraints, each added only if missing (pgm.addConstraint has no IF NOT EXISTS).
  pgm.sql(String.raw`
DO $constraints$
DECLARE
  defs text[][] := ARRAY[
    ['ord_fulfillment_seq_uq', 'UNIQUE (order_id, sequence_no)']
  ];
  i int;
BEGIN
  FOR i IN 1 .. array_length(defs, 1) LOOP
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = 'ord_fulfillment'::regclass AND conname = defs[i][1]) THEN
      EXECUTE format('ALTER TABLE ord_fulfillment ADD CONSTRAINT %I %s', defs[i][1], defs[i][2]);
    END IF;
  END LOOP;
END
$constraints$;
`);
  pgm.createIndex('ord_fulfillment', 'order_id', { name: 'idx_ord_fulfillment_order', ifNotExists: true });
  pgm.createIndex('ord_fulfillment', ['kitchen_id', 'scheduled_date', 'fulfillment_status'], {
    name: 'idx_ord_fulfillment_kitchen',
    ifNotExists: true,
  });
  pgm.createIndex('ord_fulfillment', ['customer_id', 'scheduled_date'], { name: 'idx_ord_fulfillment_customer', ifNotExists: true });
  pgm.createIndex('ord_fulfillment', 'delivery_id', {
    name: 'idx_ord_fulfillment_delivery',
    where: 'delivery_id IS NOT NULL',
    ifNotExists: true,
  });
};

exports.down = (pgm) => {
  pgm.dropTable('ord_fulfillment', { ifExists: true });
};
