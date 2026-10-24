/**
 * Order domain: ord_order, the commercial contract and financial truth. Created from one cart at checkout;
 * the kitchen accepts or rejects at order level. Amounts are integer PKR; payment_status / amount_paid follow ord_payment.
 */

exports.up = (pgm) => {
  pgm.createTable(
    'ord_order',
    {
      order_id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
      order_reference: { type: 'varchar(20)', notNull: true, unique: true },
      cart_id: { type: 'uuid', notNull: true, unique: true, references: 'ord_cart(cart_id)' },
      customer_id: { type: 'uuid', notNull: true },
      customer_details: { type: 'jsonb', notNull: true, default: pgm.func(`'{}'::jsonb`) },
      kitchen_id: { type: 'uuid', notNull: true },
      kitchen_details: { type: 'jsonb', notNull: true, default: pgm.func(`'{}'::jsonb`) },
      source_channel: {
        type: 'varchar(30)',
        notNull: true,
        default: 'CUSTOMER_APP',
        check: `source_channel IN ('CUSTOMER_APP', 'WEB')`,
      },
      order_type: { type: 'varchar(20)', notNull: true, check: `order_type IN ('INSTANT', 'PRE_ORDER', 'MIXED')` },
      order_status: {
        type: 'varchar(20)',
        notNull: true,
        default: 'PLACED',
        check: `order_status IN ('PLACED', 'ACCEPTED', 'REJECTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')`,
      },
      payment_status: {
        type: 'varchar(20)',
        notNull: true,
        default: 'UNPAID',
        check: `payment_status IN ('UNPAID', 'PARTIALLY_PAID', 'PAID', 'PARTIALLY_REFUNDED', 'REFUNDED')`,
      },
      amount_paid: { type: 'integer', notNull: true, default: 0 },
      subtotal_amount: { type: 'integer', notNull: true },
      discount_amount: { type: 'integer', notNull: true, default: 0 },
      fees_amount: { type: 'integer', notNull: true, default: 0 },
      tax_amount: { type: 'integer', notNull: true, default: 0 },
      grand_total_amount: { type: 'integer', notNull: true },
      currency_code: { type: 'varchar(3)', notNull: true, default: 'PKR' },
      drop_address_id: { type: 'uuid' },
      drop_address_details: { type: 'jsonb' },
      customer_notes: { type: 'varchar(500)' },
      acceptance_deadline_at: { type: 'timestamptz' },
      accepted_at: { type: 'timestamptz' },
      accepted_by_id: { type: 'uuid' },
      accepted_by_details: { type: 'jsonb', notNull: true, default: pgm.func(`'{}'::jsonb`) },
      rejected_at: { type: 'timestamptz' },
      rejected_by_id: { type: 'uuid' },
      rejected_by_details: { type: 'jsonb', notNull: true, default: pgm.func(`'{}'::jsonb`) },
      rejection_reason: { type: 'varchar(255)' },
      cancelled_at: { type: 'timestamptz' },
      cancelled_by_type: {
        type: 'varchar(20)',
        check: `cancelled_by_type IN ('CUSTOMER', 'KITCHEN', 'ADMIN', 'SYSTEM')`,
      },
      cancelled_by_id: { type: 'uuid' },
      cancelled_by_details: { type: 'jsonb', notNull: true, default: pgm.func(`'{}'::jsonb`) },
      cancellation_reason: { type: 'varchar(255)' },
      placed_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
      completed_at: { type: 'timestamptz' },
      created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
      updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    },
    { ifNotExists: true },
  );
  pgm.createIndex('ord_order', ['customer_id', { name: 'placed_at', sort: 'DESC' }], {
    name: 'idx_ord_order_customer',
    ifNotExists: true,
  });
  pgm.createIndex('ord_order', ['kitchen_id', 'order_status', { name: 'placed_at', sort: 'DESC' }], {
    name: 'idx_ord_order_kitchen',
    ifNotExists: true,
  });
  pgm.createIndex('ord_order', 'acceptance_deadline_at', {
    name: 'idx_ord_order_pending',
    where: "order_status = 'PLACED'",
    ifNotExists: true,
  });
  pgm.createIndex('ord_order', [{ name: 'placed_at', sort: 'DESC' }], { name: 'idx_ord_order_placed_at', ifNotExists: true });
  pgm.createIndex('ord_order', ['kitchen_id', { name: 'placed_at', sort: 'DESC' }], { name: 'idx_ord_order_kitchen_placed', ifNotExists: true });
};

exports.down = (pgm) => {
  pgm.dropTable('ord_order', { ifExists: true });
};
