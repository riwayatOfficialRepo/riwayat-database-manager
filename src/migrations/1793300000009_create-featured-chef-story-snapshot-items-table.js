/**
 * Featured Chef Stories — the chef stories published in a day's snapshot, in rail order.
 *
 * Display fields are copied at publish time so history and billing
 * reflect exactly what was published that day.
 * featured_media: the story's media at publish time, in display order.
 *
 * One active featured day = one row here for the placement.
 */
exports.up = (pgm) => {
  pgm.createTable('featured_chef_story_snapshot_items', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    snapshot_id: { type: 'uuid', notNull: true, references: 'featured_chef_story_snapshots', onDelete: 'CASCADE' },
    placement_id: { type: 'uuid', notNull: true, references: 'featured_chef_story_placements', onDelete: 'RESTRICT' },
    chef_story_id: { type: 'uuid', notNull: true },
    kitchen_id: { type: 'uuid', notNull: true },
    position: { type: 'integer', notNull: true },
    display_priority: { type: 'integer', notNull: true },
    commercial_type: { type: 'varchar(10)', notNull: true },
    chef_name: { type: 'text' },
    kitchen_name: { type: 'text' },
    kitchen_business_ref: { type: 'text' },
    featured_media: { type: 'jsonb' },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('now()') },
    deleted_at: { type: 'timestamp' },
  }, { ifNotExists: true });

  // Named constraints, each added only if missing (pgm.addConstraint has no IF NOT EXISTS).
  pgm.sql(String.raw`
DO $constraints$
DECLARE
  defs text[][] := ARRAY[
    ['uq_fcssi_snapshot_placement', 'UNIQUE (snapshot_id, placement_id)'],
    ['uq_fcssi_snapshot_position',  'UNIQUE (snapshot_id, position)']
  ];
  i int;
BEGIN
  FOR i IN 1 .. array_length(defs, 1) LOOP
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = 'featured_chef_story_snapshot_items'::regclass AND conname = defs[i][1]) THEN
      EXECUTE format('ALTER TABLE featured_chef_story_snapshot_items ADD CONSTRAINT %I %s', defs[i][1], defs[i][2]);
    END IF;
  END LOOP;
END
$constraints$;
`);

  pgm.createIndex('featured_chef_story_snapshot_items', 'placement_id', { ifNotExists: true });
};

exports.down = (pgm) => {
  pgm.dropTable('featured_chef_story_snapshot_items', { ifExists: true });
};
