/**
 * Featured Kitchens — approval lifecycle.
 *
 * A placement starts as a DRAFT, is SUBMITTED for approval through a change request
 * (request_detail, change_in_progress) and becomes SCHEDULED when approved.
 *
 * "To be removed": an ACTIVE placement keeps its status; the removal_* columns record the
 * request and the daily refresh cancels it on removal_effective_date.
 *
 * down() cancels DRAFT and SUBMITTED placements, as the old status check does not allow them.
 */
exports.up = (pgm) => {
  pgm.sql(`ALTER TABLE featured_kitchen_placements DROP CONSTRAINT IF EXISTS chk_fkp_status`);
  pgm.sql(`
    ALTER TABLE featured_kitchen_placements
      ADD CONSTRAINT chk_fkp_status
      CHECK (status IN ('DRAFT', 'SUBMITTED', 'SCHEDULED', 'ACTIVE', 'COMPLETED', 'CANCELLED'))
  `);
  pgm.alterColumn('featured_kitchen_placements', 'status', { default: 'DRAFT' });

  pgm.addColumns('featured_kitchen_placements', {
    request_detail: { type: 'jsonb' },
    change_in_progress: { type: 'boolean', notNull: true, default: false },
    removal_requested_at: { type: 'timestamp' },
    removal_requested_by: { type: 'uuid' },
    removal_requested_by_detail: { type: 'jsonb' },
    removal_reason: { type: 'text' },
    removal_effective_date: { type: 'date' },
  }, { ifNotExists: true });
};

exports.down = (pgm) => {
  pgm.dropColumns('featured_kitchen_placements', [
    'request_detail',
    'change_in_progress',
    'removal_requested_at',
    'removal_requested_by',
    'removal_requested_by_detail',
    'removal_reason',
    'removal_effective_date',
  ], { ifExists: true });

  pgm.sql(`UPDATE featured_kitchen_placements SET status = 'CANCELLED' WHERE status IN ('DRAFT', 'SUBMITTED')`);
  pgm.sql(`ALTER TABLE featured_kitchen_placements DROP CONSTRAINT IF EXISTS chk_fkp_status`);
  pgm.sql(`
    ALTER TABLE featured_kitchen_placements
      ADD CONSTRAINT chk_fkp_status CHECK (status IN ('SCHEDULED', 'ACTIVE', 'COMPLETED', 'CANCELLED'))
  `);
  pgm.alterColumn('featured_kitchen_placements', 'status', { default: 'SCHEDULED' });
};
