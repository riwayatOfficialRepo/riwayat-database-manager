/**
 * Featured Dishes — up to 3 labels and a longer caption.
 *
 * featured_label (one varchar(40)) becomes featured_labels (text[], at most 3); existing labels are kept.
 * featured_caption becomes text.
 * featured_image_url is dropped: images come from featured_dish_placement_media
 * (1793300000006_create-featured-dish-placement-media-table).
 *
 * created_job_id is dropped: placements are created as drafts directly, not by a create job.
 *
 * down() keeps the first label and the first 160 characters of the caption; image URLs and created_job_id
 * values are not restored (created_job_id is re-added as in 1779900000002).
 */
exports.up = (pgm) => {
  pgm.addColumn('featured_dish_placements', {
    featured_labels: { type: 'text[]', notNull: true, default: pgm.func(`'{}'::text[]`) },
  }, { ifNotExists: true });
  pgm.sql(`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'featured_dish_placements' AND column_name = 'featured_label'
      ) THEN
        UPDATE featured_dish_placements SET featured_labels = ARRAY[featured_label]
        WHERE featured_label IS NOT NULL AND featured_label <> '';
      END IF;
    END $$
  `);
  pgm.dropColumn('featured_dish_placements', 'featured_label', { ifExists: true });
  pgm.dropColumn('featured_dish_placements', 'featured_image_url', { ifExists: true });
  pgm.dropColumn('featured_dish_placements', 'created_job_id', { ifExists: true });
  pgm.alterColumn('featured_dish_placements', 'featured_caption', { type: 'text' });

  pgm.sql(`ALTER TABLE featured_dish_placements DROP CONSTRAINT IF EXISTS chk_fdp_featured_labels`);
  pgm.sql(`
    ALTER TABLE featured_dish_placements
      ADD CONSTRAINT chk_fdp_featured_labels CHECK (cardinality(featured_labels) <= 3)
  `);
};

exports.down = (pgm) => {
  pgm.sql(`ALTER TABLE featured_dish_placements DROP CONSTRAINT IF EXISTS chk_fdp_featured_labels`);
  pgm.alterColumn('featured_dish_placements', 'featured_caption', {
    type: 'varchar(160)',
    using: 'left(featured_caption, 160)',
  });
  pgm.addColumns('featured_dish_placements', {
    featured_image_url: { type: 'text' },
    featured_label: { type: 'varchar(40)' },
    created_job_id: { type: 'uuid', unique: true },
  }, { ifNotExists: true });
  pgm.sql(`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'featured_dish_placements' AND column_name = 'featured_labels'
      ) THEN
        UPDATE featured_dish_placements SET featured_label = left(featured_labels[1], 40);
      END IF;
    END $$
  `);
  pgm.dropColumn('featured_dish_placements', 'featured_labels', { ifExists: true });
};
