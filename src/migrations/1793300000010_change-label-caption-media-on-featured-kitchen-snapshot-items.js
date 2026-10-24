/**
 * Featured Kitchens — snapshot items follow the placement's labels, caption and media.
 *
 * featured_label becomes featured_labels (text[]); existing labels are kept.
 * featured_caption becomes text.
 * featured_media: the placement's media at publish time, in display order
 * ([{ source, mediaId, url, urlThumbnail }]).
 * featured_image_url stays and holds the cover image URL.
 *
 * down() keeps the first label and the first 160 characters of the caption.
 */
exports.up = (pgm) => {
  pgm.addColumns('featured_kitchen_snapshot_items', {
    featured_labels: { type: 'text[]', notNull: true, default: pgm.func(`'{}'::text[]`) },
    featured_media: { type: 'jsonb' },
  }, { ifNotExists: true });
  pgm.sql(`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'featured_kitchen_snapshot_items' AND column_name = 'featured_label'
      ) THEN
        UPDATE featured_kitchen_snapshot_items SET featured_labels = ARRAY[featured_label]
        WHERE featured_label IS NOT NULL AND featured_label <> '';
      END IF;
    END $$
  `);
  pgm.dropColumn('featured_kitchen_snapshot_items', 'featured_label', { ifExists: true });
  pgm.alterColumn('featured_kitchen_snapshot_items', 'featured_caption', { type: 'text' });
};

exports.down = (pgm) => {
  pgm.alterColumn('featured_kitchen_snapshot_items', 'featured_caption', {
    type: 'varchar(160)',
    using: 'left(featured_caption, 160)',
  });
  pgm.addColumn('featured_kitchen_snapshot_items', {
    featured_label: { type: 'varchar(40)' },
  }, { ifNotExists: true });
  pgm.sql(`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'featured_kitchen_snapshot_items' AND column_name = 'featured_labels'
      ) THEN
        UPDATE featured_kitchen_snapshot_items SET featured_label = left(featured_labels[1], 40);
      END IF;
    END $$
  `);
  pgm.dropColumns('featured_kitchen_snapshot_items', ['featured_labels', 'featured_media'], { ifExists: true });
};
