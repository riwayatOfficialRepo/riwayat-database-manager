/**
 * Change requests: at most one open promotion acceptance request per kitchen target.
 *
 * Partial unique index on change_requests(sub_entity_id) WHERE action = 'PROMOTION_ACCEPTANCE_REQUEST'
 * AND status IN ('INITIATED', 'PENDING') AND deleted_at IS NULL. sub_entity_id is the promotion target kitchen;
 * decided, cancelled and soft-deleted requests never block a new one. The existing indexes are kept.
 *
 * down() drops the index.
 */

exports.up = (pgm) => {
  pgm.sql(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_change_requests_open_acceptance_unique ON public.change_requests (sub_entity_id)
    WHERE action = 'PROMOTION_ACCEPTANCE_REQUEST' AND status IN ('INITIATED', 'PENDING') AND deleted_at IS NULL;`);
};

exports.down = (pgm) => {
  pgm.sql(`DROP INDEX IF EXISTS public.idx_change_requests_open_acceptance_unique;`);
};
