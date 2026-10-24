/**
 * Featured Kitchens — dish images on a kitchen placement.
 *
 * A featured kitchen can show images of its dishes as well as its own. Each row now points at
 * either a kitchen_media item (media_id) or a dish_media item (dish_media_id), never both.
 *
 * down() deletes the rows that point at dish media.
 */
exports.up = (pgm) => {
  pgm.alterColumn('featured_kitchen_placement_media', 'media_id', { notNull: false });
  pgm.addColumn('featured_kitchen_placement_media', {
    dish_media_id: { type: 'uuid', references: 'dish_media', onDelete: 'RESTRICT' },
  }, { ifNotExists: true });

  pgm.sql(`ALTER TABLE featured_kitchen_placement_media DROP CONSTRAINT IF EXISTS chk_fkpm_one_media_source`);
  pgm.sql(`
    ALTER TABLE featured_kitchen_placement_media
      ADD CONSTRAINT chk_fkpm_one_media_source CHECK (num_nonnulls(media_id, dish_media_id) = 1)
  `);
  // Named constraints, each added only if missing (pgm.addConstraint has no IF NOT EXISTS).
  pgm.sql(String.raw`
DO $constraints$
DECLARE
  defs text[][] := ARRAY[
    ['uq_fkpm_placement_dish_media', 'UNIQUE (placement_id, dish_media_id)']
  ];
  i int;
BEGIN
  FOR i IN 1 .. array_length(defs, 1) LOOP
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = 'featured_kitchen_placement_media'::regclass AND conname = defs[i][1]) THEN
      EXECUTE format('ALTER TABLE featured_kitchen_placement_media ADD CONSTRAINT %I %s', defs[i][1], defs[i][2]);
    END IF;
  END LOOP;
END
$constraints$;
`);

  pgm.createIndex('featured_kitchen_placement_media', 'dish_media_id', { ifNotExists: true });
};

exports.down = (pgm) => {
  pgm.sql(`DELETE FROM featured_kitchen_placement_media WHERE dish_media_id IS NOT NULL`);
  pgm.sql(`ALTER TABLE featured_kitchen_placement_media DROP CONSTRAINT IF EXISTS uq_fkpm_placement_dish_media`);
  pgm.sql(`ALTER TABLE featured_kitchen_placement_media DROP CONSTRAINT IF EXISTS chk_fkpm_one_media_source`);
  pgm.dropColumn('featured_kitchen_placement_media', 'dish_media_id', { ifExists: true });
  pgm.alterColumn('featured_kitchen_placement_media', 'media_id', { notNull: true });
};
