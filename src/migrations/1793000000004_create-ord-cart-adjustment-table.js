/**
 * Order domain: ord_cart_adjustment, the discounts, fees and tax shown in the cart (copied to ord_order_adjustment at checkout).
 * amount is signed: discounts negative, fees and tax positive.
 */

exports.up = (pgm) => {
  pgm.createTable(
    'ord_cart_adjustment',
    {
      cart_adjustment_id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
      cart_id: { type: 'uuid', notNull: true, references: 'ord_cart(cart_id)', onDelete: 'CASCADE' },
      cart_fulfillment_id: { type: 'uuid', references: 'ord_cart_fulfillment(cart_fulfillment_id)', onDelete: 'CASCADE' },
      cart_item_id: { type: 'uuid', references: 'ord_cart_item(cart_item_id)', onDelete: 'CASCADE' },
      adjustment_category: { type: 'varchar(20)', notNull: true, check: `adjustment_category IN ('DISCOUNT', 'FEE', 'TAX')` },
      adjustment_type: { type: 'varchar(40)', notNull: true },
      source_id: { type: 'uuid' },
      source_reference: { type: 'varchar(50)' },
      amount: { type: 'integer', notNull: true },
      currency_code: { type: 'varchar(3)', notNull: true, default: 'PKR' },
      is_visible: { type: 'boolean', notNull: true, default: true }, // false = hidden fee
      adjustment_details: { type: 'jsonb', notNull: true, default: pgm.func(`'{}'::jsonb`) },
      created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    },
    { ifNotExists: true },
  );
  pgm.createIndex('ord_cart_adjustment', ['cart_id', 'adjustment_category'], {
    name: 'idx_ord_cart_adjustment_cart',
    ifNotExists: true,
  });
};

exports.down = (pgm) => {
  pgm.dropTable('ord_cart_adjustment', { ifExists: true });
};
