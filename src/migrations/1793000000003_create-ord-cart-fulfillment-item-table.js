/**
 * Order domain: ord_cart_fulfillment_item, which cart item goes in which delivery group.
 * A normal dish has one row (day 1); a plan has one row per plan day (plan_day_no 1..plan_days).
 */

exports.up = (pgm) => {
  pgm.createTable(
    'ord_cart_fulfillment_item',
    {
      cart_fulfillment_item_id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
      cart_fulfillment_id: {
        type: 'uuid',
        notNull: true,
        references: 'ord_cart_fulfillment(cart_fulfillment_id)',
        onDelete: 'CASCADE',
      },
      cart_item_id: { type: 'uuid', notNull: true, references: 'ord_cart_item(cart_item_id)', onDelete: 'CASCADE' },
      cart_id: { type: 'uuid', notNull: true, references: 'ord_cart(cart_id)', onDelete: 'CASCADE' },
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
    ['ord_cart_fulfillment_item_uq',     'UNIQUE (cart_fulfillment_id, cart_item_id)'],
    ['ord_cart_fulfillment_item_day_uq', 'UNIQUE (cart_item_id, plan_day_no)']
  ];
  i int;
BEGIN
  FOR i IN 1 .. array_length(defs, 1) LOOP
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = 'ord_cart_fulfillment_item'::regclass AND conname = defs[i][1]) THEN
      EXECUTE format('ALTER TABLE ord_cart_fulfillment_item ADD CONSTRAINT %I %s', defs[i][1], defs[i][2]);
    END IF;
  END LOOP;
END
$constraints$;
`);
  pgm.createIndex('ord_cart_fulfillment_item', 'cart_item_id', { name: 'idx_ord_cart_fulfillment_item_item', ifNotExists: true });
  pgm.createIndex('ord_cart_fulfillment_item', 'cart_id', { name: 'idx_ord_cart_fulfillment_item_cart', ifNotExists: true });
};

exports.down = (pgm) => {
  pgm.dropTable('ord_cart_fulfillment_item', { ifExists: true });
};
