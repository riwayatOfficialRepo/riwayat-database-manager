/**
 * Order domain: ord_order_adjustment, immutable financial deltas on the order (grand_total = subtotal + SUM(amount)).
 * amount is signed: discounts negative, fees and tax positive. A correction is a new row pointing at adjusts_adjustment_id.
 */

exports.up = (pgm) => {
  pgm.createTable(
    'ord_order_adjustment',
    {
      adjustment_id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
      order_id: { type: 'uuid', notNull: true, references: 'ord_order(order_id)' },
      fulfillment_id: { type: 'uuid', references: 'ord_fulfillment(fulfillment_id)' }, // null = order level
      order_item_id: { type: 'uuid', references: 'ord_order_item(order_item_id)' }, // null = not item specific
      adjustment_category: { type: 'varchar(20)', notNull: true, check: `adjustment_category IN ('DISCOUNT', 'FEE', 'TAX')` },
      adjustment_type: { type: 'varchar(40)', notNull: true },
      source_id: { type: 'uuid' },
      source_reference: { type: 'varchar(50)' },
      amount: { type: 'integer', notNull: true },
      currency_code: { type: 'varchar(3)', notNull: true, default: 'PKR' },
      is_visible: { type: 'boolean', notNull: true, default: true }, // false = hidden fee
      adjustment_details: { type: 'jsonb', notNull: true, default: pgm.func(`'{}'::jsonb`) },
      adjusts_adjustment_id: { type: 'uuid', references: 'ord_order_adjustment(adjustment_id)' },
      applied_by_type: { type: 'varchar(20)', notNull: true, check: `applied_by_type IN ('CUSTOMER', 'ADMIN', 'SYSTEM')` },
      applied_by_id: { type: 'uuid' },
      applied_by_details: { type: 'jsonb', notNull: true, default: pgm.func(`'{}'::jsonb`) },
      applied_reason: { type: 'varchar(255)' },
      created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    },
    { ifNotExists: true },
  );
  pgm.createIndex('ord_order_adjustment', ['order_id', 'adjustment_category'], {
    name: 'idx_ord_order_adjustment_order',
    ifNotExists: true,
  });
  pgm.createIndex('ord_order_adjustment', 'fulfillment_id', {
    name: 'idx_ord_order_adjustment_fulfillment',
    where: 'fulfillment_id IS NOT NULL',
    ifNotExists: true,
  });
};

exports.down = (pgm) => {
  pgm.dropTable('ord_order_adjustment', { ifExists: true });
};
