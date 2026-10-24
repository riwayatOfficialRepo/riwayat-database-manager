/**
 * Featured Dishes — media mapping.
 *
 * Maps a featured_dish_placements row to the dish_media items that should
 * be displayed for it. Replaces the single free-form featured_image_url column
 * dropped in 1793300000005_change-label-and-caption-on-featured-dish-placements.
 *
 * - is_active: unchecking a media item hides it without removing the row, so it
 *   can be re-enabled later without losing its place in the sequence.
 * - is_first: which media item is the primary one shown on the rail. At most one
 *   per placement among non-deleted rows (enforced below).
 * - sort_order: sequential 1, 2, 3... as items are added — no arbitrary reordering.
 */
exports.up = (pgm) => {
  pgm.createTable('featured_dish_placement_media', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    placement_id: { type: 'uuid', notNull: true, references: 'featured_dish_placements', onDelete: 'CASCADE' },
    media_id: { type: 'uuid', notNull: true, references: 'dish_media', onDelete: 'RESTRICT' },
    is_active: { type: 'boolean', notNull: true, default: true },
    is_first: { type: 'boolean', notNull: true, default: false },
    sort_order: { type: 'integer', notNull: true },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('now()') },
    deleted_at: { type: 'timestamp' },
  }, { ifNotExists: true });

  // Named constraints, each added only if missing (pgm.addConstraint has no IF NOT EXISTS).
  pgm.sql(String.raw`
DO $constraints$
DECLARE
  defs text[][] := ARRAY[
    ['uq_fdpm_placement_media', 'UNIQUE (placement_id, media_id)']
  ];
  i int;
BEGIN
  FOR i IN 1 .. array_length(defs, 1) LOOP
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = 'featured_dish_placement_media'::regclass AND conname = defs[i][1]) THEN
      EXECUTE format('ALTER TABLE featured_dish_placement_media ADD CONSTRAINT %I %s', defs[i][1], defs[i][2]);
    END IF;
  END LOOP;
END
$constraints$;
`);

  pgm.createIndex('featured_dish_placement_media', 'placement_id', {
    name: 'uq_fdpm_one_first_per_placement',
    unique: true,
    where: 'is_first = true AND deleted_at IS NULL',
    ifNotExists: true,
  });

  pgm.createIndex('featured_dish_placement_media', 'placement_id', { ifNotExists: true });
  pgm.createIndex('featured_dish_placement_media', 'media_id', { ifNotExists: true });
};

exports.down = (pgm) => {
  pgm.dropTable('featured_dish_placement_media', { ifExists: true });
};
