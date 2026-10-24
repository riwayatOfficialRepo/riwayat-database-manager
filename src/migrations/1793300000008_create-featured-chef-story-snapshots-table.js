/**
 * Featured Chef Stories — one published snapshot per calendar day.
 *
 * Built by the daily merchandising refresh. Placement active days and
 * actual start/end dates are derived from these snapshots.
 */
exports.up = (pgm) => {
  pgm.createTable('featured_chef_story_snapshots', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    snapshot_date: { type: 'date', notNull: true, unique: true },
    capacity: { type: 'integer', notNull: true },
    eligible_count: { type: 'integer', notNull: true, default: 0 },
    published_count: { type: 'integer', notNull: true, default: 0 },
    published_at: { type: 'timestamp', notNull: true, default: pgm.func('now()') },
    trace_id: { type: 'text' },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('now()') },
    deleted_at: { type: 'timestamp' },
  }, { ifNotExists: true });
};

exports.down = (pgm) => {
  pgm.dropTable('featured_chef_story_snapshots', { ifExists: true });
};
