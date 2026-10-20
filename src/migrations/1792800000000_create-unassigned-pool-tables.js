/**
 * Delivery dispatch: the unassigned ride pool (dl_unassigned_pool) and its audit trail (dl_pool_activity).
 *
 * A ride that auto-dispatch could not place (no rider accepted within the attempt cap) enters the pool;
 * delivery company users claim it and offer it to a rider of their choice.
 *
 * dl_ride, dl_delivery, dl_ride_offer and dl_delivery_offer already exist (production schema, see the
 * 1792300000005 sync migration); they are not created or altered here.
 * down() drops only the two pool tables.
 */

exports.up = (pgm) => {
  pgm.createTable(
    'dl_unassigned_pool',
    {
      pool_id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
      pool_reference: { type: 'text', notNull: true, unique: true },
      ride_id: { type: 'uuid', notNull: true, references: 'dl_ride(ride_id)', onDelete: 'CASCADE' },
      pool_reason: {
        type: 'text',
        check: `pool_reason IN ('AUTO_DISPATCH_EXHAUSTED', 'RIDE_CANCELLED_REPOOLED', 'MANUALLY_POOLED', 'NO_PICKUP_COORDINATES')`,
      },
      status: { type: 'text', notNull: true, default: 'AVAILABLE', check: `status IN ('AVAILABLE', 'OFFER_PENDING', 'CLAIMED')` },
      upfront_message: { type: 'text' },
      ride_in_pool_at: { type: 'timestamptz' },
      ride_in_pool_by: { type: 'text' },
      ride_in_pool_details: { type: 'jsonb' },
      escalation_status: { type: 'text' }, // ESCALATED or null
      escalated_at: { type: 'timestamptz' },
      escalated_by_details: { type: 'jsonb' },
      metadata: { type: 'jsonb', default: pgm.func(`'{}'::jsonb`) },
      created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
      updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    },
    { ifNotExists: true },
  );
  pgm.createIndex('dl_unassigned_pool', 'ride_id', { name: 'idx_dl_unassigned_pool_ride', ifNotExists: true });
  pgm.createIndex('dl_unassigned_pool', 'status', { name: 'idx_dl_unassigned_pool_status', ifNotExists: true });
  pgm.createIndex('dl_unassigned_pool', 'escalation_status', { name: 'idx_dl_unassigned_pool_escalation', ifNotExists: true });

  pgm.createTable(
    'dl_pool_activity',
    {
      activity_id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
      business_reference: { type: 'text', notNull: true, unique: true },
      pool_id: { type: 'uuid', notNull: true, references: 'dl_unassigned_pool(pool_id)', onDelete: 'CASCADE' },
      ride_id: { type: 'uuid', references: 'dl_ride(ride_id)', onDelete: 'SET NULL' },
      action: { type: 'text', check: `action IN ('VIEWED', 'OFFERED', 'ACCEPTED', 'REJECTED', 'ESCALATED')` },
      company_id: { type: 'uuid', references: 'dl_company(delivery_company_id)', onDelete: 'SET NULL' },
      user_id: { type: 'uuid' },
      details: { type: 'jsonb', default: pgm.func(`'{}'::jsonb`) },
      created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    },
    { ifNotExists: true },
  );
  pgm.createIndex('dl_pool_activity', 'pool_id', { name: 'idx_dl_pool_activity_pool', ifNotExists: true });
  pgm.createIndex('dl_pool_activity', 'ride_id', { name: 'idx_dl_pool_activity_ride', ifNotExists: true });
  pgm.createIndex('dl_pool_activity', 'company_id', { name: 'idx_dl_pool_activity_company', ifNotExists: true });
};

exports.down = (pgm) => {
  pgm.dropTable('dl_pool_activity', { ifExists: true });
  pgm.dropTable('dl_unassigned_pool', { ifExists: true });
};
