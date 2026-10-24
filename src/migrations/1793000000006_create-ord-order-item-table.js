/**
 * Order domain: ord_order_item, what was purchased, with the price locked at checkout.
 * A plan is one item (qty 1, full variant price); its daily drops are rows in ord_fulfillment_item.
 */

exports.up = (pgm) => {
  pgm.createTable(
    'ord_order_item',
    {
      order_item_id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
      order_id: { type: 'uuid', notNull: true, references: 'ord_order(order_id)' },
      cart_item_id: { type: 'uuid' },
      dish_id: { type: 'uuid', notNull: true },
      dish_details: { type: 'jsonb', notNull: true, default: pgm.func(`'{}'::jsonb`) },
      variant_id: { type: 'uuid', notNull: true },
      variant_details: { type: 'jsonb', notNull: true, default: pgm.func(`'{}'::jsonb`) },
      preparation_mode: { type: 'varchar(20)', notNull: true, check: `preparation_mode IN ('READY', 'PRE_ORDER')` },
      quantity: { type: 'integer', notNull: true, check: 'quantity > 0' },
      addon_details: { type: 'jsonb', notNull: true, default: pgm.func(`'[]'::jsonb`) },
      customization_details: { type: 'jsonb', notNull: true, default: pgm.func(`'[]'::jsonb`) },
      unit_price_amount: { type: 'integer', notNull: true },
      unit_discounted_amount: { type: 'integer' },
      addons_amount: { type: 'integer', notNull: true, default: 0 },
      customizations_amount: { type: 'integer', notNull: true, default: 0 },
      line_total_amount: { type: 'integer', notNull: true },
      special_notes: { type: 'varchar(500)' },
      created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    },
    { ifNotExists: true },
  );
  pgm.createIndex('ord_order_item', 'order_id', { name: 'idx_ord_order_item_order', ifNotExists: true });
  pgm.createIndex('ord_order_item', 'variant_id', { name: 'idx_ord_order_item_variant', ifNotExists: true });
};

exports.down = (pgm) => {
  pgm.dropTable('ord_order_item', { ifExists: true });
};
