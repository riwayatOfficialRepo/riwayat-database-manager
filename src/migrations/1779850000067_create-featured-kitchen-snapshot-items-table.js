/**
 * Featured Kitchens — the kitchens published in a day's snapshot, in rail order.
 *
 * Display fields are copied at publish time so the rail (and history/billing)
 * reflect exactly what customers saw that day.
 *
 * One active featured day = one row here for the placement.
 */
exports.up = (pgm) => {
  pgm.createTable('featured_kitchen_snapshot_items', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    snapshot_id: { type: 'uuid', notNull: true, references: 'featured_kitchen_snapshots', onDelete: 'CASCADE' },
    placement_id: { type: 'uuid', notNull: true, references: 'featured_kitchen_placements', onDelete: 'RESTRICT' },
    kitchen_id: { type: 'uuid', notNull: true },
    position: { type: 'integer', notNull: true },
    display_priority: { type: 'integer', notNull: true },
    commercial_type: { type: 'varchar(10)', notNull: true },
    kitchen_name: { type: 'text' },
    kitchen_business_ref: { type: 'text' },
    featured_image_url: { type: 'text' },
    featured_label: { type: 'varchar(40)' },
    featured_caption: { type: 'varchar(160)' },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('now()') },
    deleted_at: { type: 'timestamp' },
  }, { ifNotExists: true });

  pgm.addConstraint('featured_kitchen_snapshot_items', 'uq_fksi_snapshot_placement',
    { unique: ['snapshot_id', 'placement_id'] });
  pgm.addConstraint('featured_kitchen_snapshot_items', 'uq_fksi_snapshot_position',
    { unique: ['snapshot_id', 'position'] });

  pgm.createIndex('featured_kitchen_snapshot_items', 'placement_id', { ifNotExists: true });
};

exports.down = (pgm) => {
  pgm.dropTable('featured_kitchen_snapshot_items', { ifExists: true });
};
