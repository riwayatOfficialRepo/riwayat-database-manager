/**
 * Order domain: ord_cart_item, the dish variants selected in the cart (a plan dish is one line).
 * availability_status / availability_details hold the rule-engine result for the line.
 */

exports.up = (pgm) => {
  pgm.createTable(
    'ord_cart_item',
    {
      cart_item_id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
      cart_id: { type: 'uuid', notNull: true, references: 'ord_cart(cart_id)', onDelete: 'CASCADE' },
      dish_id: { type: 'uuid', notNull: true },
      dish_details: { type: 'jsonb', notNull: true, default: pgm.func(`'{}'::jsonb`) },
      variant_id: { type: 'uuid', notNull: true },
      variant_details: { type: 'jsonb', notNull: true, default: pgm.func(`'{}'::jsonb`) },
      preparation_mode: { type: 'varchar(20)', notNull: true, check: `preparation_mode IN ('READY', 'PRE_ORDER')` },
      quantity: { type: 'integer', notNull: true, check: 'quantity > 0' },
      addon_details: { type: 'jsonb', notNull: true, default: pgm.func(`'[]'::jsonb`) },
      customization_details: { type: 'jsonb', notNull: true, default: pgm.func(`'[]'::jsonb`) },
      price_details: { type: 'jsonb', notNull: true, default: pgm.func(`'{}'::jsonb`) },
      special_notes: { type: 'varchar(500)' },
      availability_status: {
        type: 'varchar(30)',
        notNull: true,
        default: 'AVAILABLE',
        check: `availability_status IN ('AVAILABLE', 'UNAVAILABLE', 'SOLD_OUT', 'INSUFFICIENT_STOCK', 'BELOW_MIN_QTY', 'NOT_AVAILABLE_ON_DATE', 'KITCHEN_CLOSED')`,
      },
      availability_details: { type: 'jsonb', notNull: true, default: pgm.func(`'{}'::jsonb`) },
      created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
      updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    },
    { ifNotExists: true },
  );
  pgm.createIndex('ord_cart_item', ['cart_id', 'created_at'], { name: 'idx_ord_cart_item_cart', ifNotExists: true });
};

exports.down = (pgm) => {
  pgm.dropTable('ord_cart_item', { ifExists: true });
};
