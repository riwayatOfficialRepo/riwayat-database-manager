/**
 * Featured Chef Stories — admin-configured placements.
 *
 * Rows are never physically deleted: finished placements (COMPLETED / CANCELLED)
 * stay for reporting and billing. deleted_at exists only to match BaseRepository conventions.
 *
 * placement_ref is a human-facing reference (FCS-000101) generated from a sequence.
 *
 * A placement starts as a DRAFT, is SUBMITTED for approval through a change request
 * (request_detail, change_in_progress) and becomes SCHEDULED when approved.
 * "To be removed": an ACTIVE placement keeps its status; the removal_* columns record the
 * request and the daily refresh cancels it on removal_effective_date.
 */
exports.up = (pgm) => {
  pgm.sql(`CREATE SEQUENCE IF NOT EXISTS featured_chef_story_placement_ref_seq START WITH 1`);

  pgm.createTable('featured_chef_story_placements', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    placement_ref: {
      type: 'varchar(20)',
      notNull: true,
      unique: true,
      default: pgm.func(`'FCS-' || lpad(nextval('featured_chef_story_placement_ref_seq')::text, 6, '0')`),
    },
    kitchen_id: { type: 'uuid', notNull: true, references: 'kitchens', onDelete: 'RESTRICT' },
    chef_story_id: { type: 'uuid', notNull: true, references: 'kitchen_chef_stories', onDelete: 'RESTRICT' },

    commercial_type: { type: 'varchar(10)', notNull: true },
    start_date: { type: 'date', notNull: true },
    end_date: { type: 'date', notNull: true },
    display_priority: { type: 'integer', notNull: true },
    internal_note: { type: 'text' },

    status: { type: 'varchar(20)', notNull: true, default: 'DRAFT' },

    // Derived from published snapshots when the placement finishes
    actual_start_date: { type: 'date' },
    actual_end_date: { type: 'date' },
    active_days: { type: 'integer', notNull: true, default: 0 },

    ended_at: { type: 'timestamp' },
    ended_by: { type: 'uuid' },
    ended_by_detail: { type: 'jsonb' },
    end_reason: { type: 'text' },

    request_detail: { type: 'jsonb' },
    change_in_progress: { type: 'boolean', notNull: true, default: false },

    removal_requested_at: { type: 'timestamp' },
    removal_requested_by: { type: 'uuid' },
    removal_requested_by_detail: { type: 'jsonb' },
    removal_reason: { type: 'text' },
    removal_effective_date: { type: 'date' },

    created_by: { type: 'uuid' },
    created_by_detail: { type: 'jsonb' },
    updated_by: { type: 'uuid' },
    updated_by_detail: { type: 'jsonb' },

    created_at: { type: 'timestamp', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('now()') },
    deleted_at: { type: 'timestamp' },
  }, { ifNotExists: true });

  // Named constraints, each added only if missing (pgm.addConstraint has no IF NOT EXISTS).
  pgm.sql(String.raw`
DO $constraints$
DECLARE
  defs text[][] := ARRAY[
    ['chk_fcsp_commercial_type',  $c$CHECK (commercial_type IN ('PAID', 'FREE'))$c$],
    ['chk_fcsp_status',           $c$CHECK (status IN ('DRAFT', 'SUBMITTED', 'SCHEDULED', 'ACTIVE', 'COMPLETED', 'CANCELLED'))$c$],
    ['chk_fcsp_date_range',       'CHECK (end_date >= start_date)'],
    ['chk_fcsp_display_priority', 'CHECK (display_priority >= 1)']
  ];
  i int;
BEGIN
  FOR i IN 1 .. array_length(defs, 1) LOOP
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = 'featured_chef_story_placements'::regclass AND conname = defs[i][1]) THEN
      EXECUTE format('ALTER TABLE featured_chef_story_placements ADD CONSTRAINT %I %s', defs[i][1], defs[i][2]);
    END IF;
  END LOOP;
END
$constraints$;
`);

  pgm.createIndex('featured_chef_story_placements', 'status', { ifNotExists: true });
  pgm.createIndex('featured_chef_story_placements', 'kitchen_id', { ifNotExists: true });
  pgm.createIndex('featured_chef_story_placements', 'chef_story_id', { ifNotExists: true });
  pgm.createIndex('featured_chef_story_placements', ['start_date', 'end_date'], { ifNotExists: true });
};

exports.down = (pgm) => {
  pgm.dropTable('featured_chef_story_placements', { ifExists: true });
  pgm.sql(`DROP SEQUENCE IF EXISTS featured_chef_story_placement_ref_seq`);
};
