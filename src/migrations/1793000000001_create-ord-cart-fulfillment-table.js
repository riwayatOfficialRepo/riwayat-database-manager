/**
 * Order domain: ord_cart_fulfillment, the delivery groups chosen in the cart (e.g. "muffins now" + "cake on 29 Oct").
 * drop_address_id / drop_address_details are null when the group goes to the cart's drop address.
 */

exports.up = (pgm) => {
  pgm.createTable(
    'ord_cart_fulfillment',
    {
      cart_fulfillment_id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
      cart_id: { type: 'uuid', notNull: true, references: 'ord_cart(cart_id)', onDelete: 'CASCADE' },
      sequence_no: { type: 'smallint', notNull: true },
      fulfillment_type: { type: 'varchar(20)', notNull: true, check: `fulfillment_type IN ('INSTANT', 'SCHEDULED')` },
      is_custom_date: { type: 'boolean', notNull: true, default: false },
      scheduled_date: { type: 'date' }, // null for INSTANT
      window_start_at: { type: 'timestamptz' },
      window_end_at: { type: 'timestamptz' },
      estimated_delivery_at: { type: 'timestamptz' },
      delivery_type: {
        type: 'varchar(20)',
        notNull: true,
        default: 'RIWAYAT_DELIVERY',
        check: `delivery_type IN ('RIWAYAT_DELIVERY', 'SELF_PICKUP', 'KITCHEN_DROP')`,
      },
      drop_address_id: { type: 'uuid' },
      drop_address_details: { type: 'jsonb' },
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
    ['ord_cart_fulfillment_seq_uq', 'UNIQUE (cart_id, sequence_no)']
  ];
  i int;
BEGIN
  FOR i IN 1 .. array_length(defs, 1) LOOP
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = 'ord_cart_fulfillment'::regclass AND conname = defs[i][1]) THEN
      EXECUTE format('ALTER TABLE ord_cart_fulfillment ADD CONSTRAINT %I %s', defs[i][1], defs[i][2]);
    END IF;
  END LOOP;
END
$constraints$;
`);
};

exports.down = (pgm) => {
  pgm.dropTable('ord_cart_fulfillment', { ifExists: true });
};
