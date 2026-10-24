/**
 * Order domain: ord_payment, every money movement on an order (amount positive = received, negative = refund).
 * receipt_id is generated on success and becomes the receipt service's receipts.id (created async, so no FK).
 */

exports.up = (pgm) => {
  pgm.createTable(
    'ord_payment',
    {
      payment_id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
      payment_reference: { type: 'varchar(25)', notNull: true, unique: true },
      order_id: { type: 'uuid', notNull: true, references: 'ord_order(order_id)' },
      customer_id: { type: 'uuid', notNull: true },
      payment_method: {
        type: 'varchar(20)',
        notNull: true,
        check: `payment_method IN ('COD', 'CARD', 'WALLET', 'EASYPAISA', 'JAZZCASH', 'BANK_TRANSFER')`,
      },
      amount: { type: 'integer', notNull: true },
      currency_code: { type: 'varchar(3)', notNull: true, default: 'PKR' },
      payment_status: {
        type: 'varchar(20)',
        notNull: true,
        default: 'INITIATED',
        check: `payment_status IN ('INITIATED', 'PENDING', 'SUCCESS', 'FAILED', 'CANCELLED')`,
      },
      linked_entities: { type: 'jsonb', notNull: true, default: pgm.func(`'[]'::jsonb`) },
      gateway_details: { type: 'jsonb', notNull: true, default: pgm.func(`'{}'::jsonb`) },
      failure_reason_code: { type: 'varchar(50)' },
      failure_reason_description: { type: 'varchar(255)' },
      receipt_id: { type: 'uuid', unique: true },
      collected_by_type: {
        type: 'varchar(20)',
        check: `collected_by_type IN ('RIDER', 'KITCHEN', 'ADMIN', 'SYSTEM')`,
      },
      collected_by_id: { type: 'uuid' },
      collected_by_details: { type: 'jsonb', notNull: true, default: pgm.func(`'{}'::jsonb`) },
      paid_at: { type: 'timestamptz' },
      created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
      updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    },
    { ifNotExists: true },
  );
  pgm.createIndex('ord_payment', ['order_id', 'payment_status'], { name: 'idx_ord_payment_order', ifNotExists: true });
  // webhook lookup by gateway reference
  pgm.sql(`CREATE INDEX IF NOT EXISTS idx_ord_payment_gateway ON ord_payment ((gateway_details->>'gateway_reference'))`);
  pgm.sql(`CREATE INDEX IF NOT EXISTS idx_ord_payment_linked ON ord_payment USING GIN (linked_entities jsonb_path_ops)`);
};

exports.down = (pgm) => {
  pgm.dropTable('ord_payment', { ifExists: true });
};
