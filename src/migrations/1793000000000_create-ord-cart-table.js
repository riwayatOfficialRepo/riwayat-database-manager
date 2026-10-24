/**
 * Order domain: ord_cart, the checkout intent (draft order). One kitchen per cart; one CREATED cart per customer / guest.
 * Customer, kitchen and address ids are plain UUIDs (no FK to other domains); *_details hold display snapshots.
 */

exports.up = (pgm) => {
  pgm.createTable(
    'ord_cart',
    {
      cart_id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
      customer_id: { type: 'uuid' }, // null only for guest carts
      guest_key: { type: 'varchar(100)' },
      customer_details: { type: 'jsonb', notNull: true, default: pgm.func(`'{}'::jsonb`) },
      kitchen_id: { type: 'uuid', notNull: true },
      kitchen_details: { type: 'jsonb', notNull: true, default: pgm.func(`'{}'::jsonb`) },
      cart_status: {
        type: 'varchar(20)',
        notNull: true,
        default: 'CREATED',
        check: `cart_status IN ('CREATED', 'CHECKED_OUT', 'EXPIRED', 'CANCELLED')`,
      },
      is_checkout_ready: { type: 'boolean', notNull: true, default: false },
      validation_details: { type: 'jsonb', notNull: true, default: pgm.func(`'{}'::jsonb`) },
      drop_address_id: { type: 'uuid' },
      drop_address_details: { type: 'jsonb', notNull: true, default: pgm.func(`'{}'::jsonb`) },
      amount_details: { type: 'jsonb', notNull: true, default: pgm.func(`'{}'::jsonb`) },
      order_id: { type: 'uuid' }, // set at checkout
      expires_at: { type: 'timestamptz', notNull: true, default: pgm.func(`now() + interval '2 days'`) },
      checked_out_at: { type: 'timestamptz' },
      cancelled_at: { type: 'timestamptz' },
      cancel_reason: { type: 'varchar(255)' },
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
    ['ord_cart_owner_chk', 'CHECK (customer_id IS NOT NULL OR guest_key IS NOT NULL)']
  ];
  i int;
BEGIN
  FOR i IN 1 .. array_length(defs, 1) LOOP
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = 'ord_cart'::regclass AND conname = defs[i][1]) THEN
      EXECUTE format('ALTER TABLE ord_cart ADD CONSTRAINT %I %s', defs[i][1], defs[i][2]);
    END IF;
  END LOOP;
END
$constraints$;
`);

  pgm.createIndex('ord_cart', 'customer_id', {
    name: 'ord_cart_active_customer_uq',
    unique: true,
    where: "cart_status = 'CREATED' AND customer_id IS NOT NULL",
    ifNotExists: true,
  });
  pgm.createIndex('ord_cart', 'guest_key', {
    name: 'ord_cart_active_guest_uq',
    unique: true,
    where: "cart_status = 'CREATED' AND guest_key IS NOT NULL",
    ifNotExists: true,
  });
  pgm.createIndex('ord_cart', 'expires_at', { name: 'idx_ord_cart_expiry', where: "cart_status = 'CREATED'", ifNotExists: true });
  pgm.createIndex('ord_cart', 'cancelled_at', { name: 'idx_ord_cart_purge', where: "cart_status = 'CANCELLED'", ifNotExists: true });
  pgm.createIndex('ord_cart', ['kitchen_id', 'cart_status'], { name: 'idx_ord_cart_kitchen', ifNotExists: true });
  pgm.createIndex('ord_cart', [{ name: 'created_at', sort: 'DESC' }], { name: 'idx_ord_cart_created_at', ifNotExists: true });
  pgm.createIndex('ord_cart', ['customer_id', { name: 'created_at', sort: 'DESC' }], { name: 'idx_ord_cart_customer', ifNotExists: true });
};

exports.down = (pgm) => {
  pgm.dropTable('ord_cart', { ifExists: true });
};
