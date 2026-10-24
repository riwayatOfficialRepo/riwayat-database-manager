/**
 * Order domain: ord_fulfillment_item, the order item(s) in each drop.
 * A normal dish has one row (day 1); a plan has one row per plan day with that day's menu in item_details.
 */

exports.up = (pgm) => {
  pgm.createTable(
    'ord_fulfillment_item',
    {
      fulfillment_item_id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
      fulfillment_id: { type: 'uuid', notNull: true, references: 'ord_fulfillment(fulfillment_id)' },
      order_item_id: { type: 'uuid', notNull: true, references: 'ord_order_item(order_item_id)' },
      order_id: { type: 'uuid', notNull: true, references: 'ord_order(order_id)' },
      quantity: { type: 'integer', notNull: true, check: 'quantity > 0' },
      plan_day_no: { type: 'smallint', notNull: true, default: 1, check: 'plan_day_no >= 1' },
      item_details: { type: 'jsonb', notNull: true, default: pgm.func(`'{}'::jsonb`) },
      created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    },
    { ifNotExists: true },
  );
  // Named constraints, each added only if missing (pgm.addConstraint has no IF NOT EXISTS).
  pgm.sql(String.raw`
DO $constraints$
DECLARE
  defs text[][] := ARRAY[
    ['ord_fulfillment_item_uq',     'UNIQUE (fulfillment_id, order_item_id)'],
    ['ord_fulfillment_item_day_uq', 'UNIQUE (order_item_id, plan_day_no)']
  ];
  i int;
BEGIN
  FOR i IN 1 .. array_length(defs, 1) LOOP
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = 'ord_fulfillment_item'::regclass AND conname = defs[i][1]) THEN
      EXECUTE format('ALTER TABLE ord_fulfillment_item ADD CONSTRAINT %I %s', defs[i][1], defs[i][2]);
    END IF;
  END LOOP;
END
$constraints$;
`);
  pgm.createIndex('ord_fulfillment_item', 'order_item_id', { name: 'idx_ord_fulfillment_item_item', ifNotExists: true });
  pgm.createIndex('ord_fulfillment_item', 'order_id', { name: 'idx_ord_fulfillment_item_order', ifNotExists: true });
};

exports.down = (pgm) => {
  pgm.dropTable('ord_fulfillment_item', { ifExists: true });
};
