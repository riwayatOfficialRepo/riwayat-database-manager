/**
 * Featured Kitchens — media mapping.
 *
 * Maps a featured_kitchen_placements row to the kitchen_media items that should
 * be displayed for it. Replaces the single free-form featured_image_url column
 * deferred in 1779850000065_create-featured-kitchen-placements-table.
 *
 * - is_active: unchecking a media item hides it without removing the row, so it
 *   can be re-enabled later without losing its place in the sequence.
 * - is_first: which media item is the primary one shown on the rail. At most one
 *   per placement among active, non-deleted rows (enforced below).
 * - sort_order: sequential 1, 2, 3... as items are added — no arbitrary reordering.
 */
exports.up = (pgm) => {
  pgm.createTable('featured_kitchen_placement_media', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    placement_id: { type: 'uuid', notNull: true, references: 'featured_kitchen_placements', onDelete: 'CASCADE' },
    media_id: { type: 'uuid', notNull: true, references: 'kitchen_media', onDelete: 'RESTRICT' },
    is_active: { type: 'boolean', notNull: true, default: true },
    is_first: { type: 'boolean', notNull: true, default: false },
    sort_order: { type: 'integer', notNull: true },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('now()') },
    deleted_at: { type: 'timestamp' },
  }, { ifNotExists: true });

  pgm.addConstraint('featured_kitchen_placement_media', 'uq_fkpm_placement_media',
    { unique: ['placement_id', 'media_id'] });

  pgm.createIndex('featured_kitchen_placement_media', 'placement_id', {
    name: 'uq_fkpm_one_first_per_placement',
    unique: true,
    where: 'is_first = true AND deleted_at IS NULL',
    ifNotExists: true,
  });

  pgm.createIndex('featured_kitchen_placement_media', 'placement_id', { ifNotExists: true });
  pgm.createIndex('featured_kitchen_placement_media', 'media_id', { ifNotExists: true });
};

exports.down = (pgm) => {
  pgm.dropTable('featured_kitchen_placement_media', { ifExists: true });
};
