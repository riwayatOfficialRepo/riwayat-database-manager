/**
 * Order domain: ord_order_event, the immutable timeline of order and fulfillment changes.
 */

exports.up = (pgm) => {
  pgm.createTable(
    'ord_order_event',
    {
      event_id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
      order_id: { type: 'uuid', notNull: true, references: 'ord_order(order_id)' },
      event_type: { type: 'varchar(50)', notNull: true },
      description: { type: 'varchar(500)', notNull: true },
      actor_type: {
        type: 'varchar(20)',
        notNull: true,
        check: `actor_type IN ('CUSTOMER', 'KITCHEN', 'ADMIN', 'RIDER', 'SYSTEM')`,
      },
      actor_id: { type: 'uuid' },
      actor_details: { type: 'jsonb', notNull: true, default: pgm.func(`'{}'::jsonb`) },
      payload: { type: 'jsonb', notNull: true, default: pgm.func(`'{}'::jsonb`) },
      created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    },
    { ifNotExists: true },
  );
  pgm.createIndex('ord_order_event', ['order_id', 'created_at'], { name: 'idx_ord_order_event_order', ifNotExists: true });
};

exports.down = (pgm) => {
  pgm.dropTable('ord_order_event', { ifExists: true });
};
