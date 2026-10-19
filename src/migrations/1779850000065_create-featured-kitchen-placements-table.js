/**
 * Featured Kitchens — admin-configured placements.
 *
 * Rows are never physically deleted: finished placements (COMPLETED / CANCELLED)
 * stay for reporting and billing. deleted_at exists only to match BaseRepository conventions.
 *
 * placement_ref is a human-facing reference (FEA-000101) generated from a sequence.
 */
exports.up = (pgm) => {
  pgm.sql(`CREATE SEQUENCE IF NOT EXISTS featured_kitchen_placement_ref_seq START WITH 1`);

  pgm.createTable('featured_kitchen_placements', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    placement_ref: {
      type: 'varchar(20)',
      notNull: true,
      unique: true,
      default: pgm.func(`'FEA-' || lpad(nextval('featured_kitchen_placement_ref_seq')::text, 6, '0')`),
    },
    kitchen_id: { type: 'uuid', notNull: true, references: 'kitchens', onDelete: 'RESTRICT' },

    // Media integration deferred — free-form URL for now
    featured_image_url: { type: 'text' },
    featured_label: { type: 'varchar(40)' },
    featured_caption: { type: 'varchar(160)' },

    commercial_type: { type: 'varchar(10)', notNull: true },
    start_date: { type: 'date', notNull: true },
    end_date: { type: 'date', notNull: true },
    display_priority: { type: 'integer', notNull: true },
    internal_note: { type: 'text' },

    status: { type: 'varchar(20)', notNull: true, default: 'SCHEDULED' },

    // Derived from published snapshots when the placement finishes
    actual_start_date: { type: 'date' },
    actual_end_date: { type: 'date' },
    active_days: { type: 'integer', notNull: true, default: 0 },

    ended_at: { type: 'timestamp' },
    ended_by: { type: 'uuid' },
    ended_by_detail: { type: 'jsonb' },
    end_reason: { type: 'text' },

    // Job that created the row — idempotency guard for worker redelivery
    created_job_id: { type: 'uuid', unique: true },
    created_by: { type: 'uuid' },
    created_by_detail: { type: 'jsonb' },
    updated_by: { type: 'uuid' },
    updated_by_detail: { type: 'jsonb' },

    created_at: { type: 'timestamp', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('now()') },
    deleted_at: { type: 'timestamp' },
  }, { ifNotExists: true });

  pgm.addConstraint('featured_kitchen_placements', 'chk_fkp_commercial_type',
    `CHECK (commercial_type IN ('PAID', 'FREE'))`);
  pgm.addConstraint('featured_kitchen_placements', 'chk_fkp_status',
    `CHECK (status IN ('SCHEDULED', 'ACTIVE', 'COMPLETED', 'CANCELLED'))`);
  pgm.addConstraint('featured_kitchen_placements', 'chk_fkp_date_range',
    `CHECK (end_date >= start_date)`);
  pgm.addConstraint('featured_kitchen_placements', 'chk_fkp_display_priority',
    `CHECK (display_priority >= 1)`);

  pgm.createIndex('featured_kitchen_placements', 'status', { ifNotExists: true });
  pgm.createIndex('featured_kitchen_placements', 'kitchen_id', { ifNotExists: true });
  pgm.createIndex('featured_kitchen_placements', ['start_date', 'end_date'], { ifNotExists: true });
};

exports.down = (pgm) => {
  pgm.dropTable('featured_kitchen_placements', { ifExists: true });
  pgm.sql(`DROP SEQUENCE IF EXISTS featured_kitchen_placement_ref_seq`);
};
