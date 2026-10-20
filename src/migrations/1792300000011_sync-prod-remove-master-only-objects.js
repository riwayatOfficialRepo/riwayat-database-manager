/**
 * Sync with production: REMOVE objects that master creates but production does not have
 *
 * Part of the production schema sync. Generated from a read-only schema dump of the shared
 * dev/production database (2026-10-17) and compared with a database built from master.
 * Every statement is guarded: on production (where these objects already exist) it does nothing;
 * on a fresh database it recreates what production has.
 * down() is intentionally a no-op so that migrate:down can never drop live tables or data.
 * 
 * REVIEW BEFORE MERGING. On production every statement is a no-op (IF EXISTS on objects that are not there).
 * On a fresh database it drops columns, constraints, indexes, triggers and functions that master creates
 * but production never got (or had removed by hand). Some are real integrity features, for example the
 * case_activity -> cases foreign key and the prospects status CHECK. If you prefer master's version of an
 * object, delete its line here and add it to production with a separate migration instead.
 */

exports.up = (pgm) => {
  pgm.sql(String.raw`
ALTER TABLE public.cases DROP COLUMN IF EXISTS assigned_queue CASCADE;

ALTER TABLE public.cases DROP COLUMN IF EXISTS assigned_to CASCADE;

ALTER TABLE public.cases DROP COLUMN IF EXISTS current_actor CASCADE;

ALTER TABLE public.cases DROP COLUMN IF EXISTS kitchen_id CASCADE;

-- cases.raised_on_behalf_role is kept here: 1792300000012 copies it into raised_on_behalf_type
-- and the rebuild removes it.

ALTER TABLE public.cases DROP COLUMN IF EXISTS updated_by CASCADE;

ALTER TABLE public.promotion_audience_rules DROP COLUMN IF EXISTS rule_type CASCADE;

ALTER TABLE public.promotion_audience_rules_staging DROP COLUMN IF EXISTS rule_type CASCADE;

ALTER TABLE public.rider_media DROP COLUMN IF EXISTS caption CASCADE;

ALTER TABLE public.rider_media DROP COLUMN IF EXISTS category_type CASCADE;

ALTER TABLE public.rider_media DROP COLUMN IF EXISTS deleted_at CASCADE;

ALTER TABLE public.rider_media DROP COLUMN IF EXISTS entity_id CASCADE;

ALTER TABLE public.rider_media DROP COLUMN IF EXISTS entity_type CASCADE;

ALTER TABLE public.rider_media DROP COLUMN IF EXISTS id CASCADE;

ALTER TABLE public.rider_media DROP COLUMN IF EXISTS media_name CASCADE;

ALTER TABLE public.rider_media DROP COLUMN IF EXISTS s3_key_original CASCADE;

ALTER TABLE public.rider_media DROP COLUMN IF EXISTS s3_key_processed CASCADE;

ALTER TABLE public.rider_media DROP COLUMN IF EXISTS s3_key_thumbnail CASCADE;

ALTER TABLE public.case_activity DROP CONSTRAINT IF EXISTS case_activity_case_id_fkey;

ALTER TABLE public.cases DROP CONSTRAINT IF EXISTS cases_initiated_by_id_idempotency_key_key;

ALTER TABLE public.company_user_pin DROP CONSTRAINT IF EXISTS company_user_pin_company_user_id_fkey;

ALTER TABLE public.feedbacks DROP CONSTRAINT IF EXISTS feedback_feedback_type_check;

ALTER TABLE public.prospects DROP CONSTRAINT IF EXISTS prospects_status_check;

ALTER TABLE public.rider_vehicle DROP CONSTRAINT IF EXISTS rider_vehicle_status_check;

DROP INDEX IF EXISTS public.idx_companies_company_code;

DROP INDEX IF EXISTS public.idx_companies_status;

DROP INDEX IF EXISTS public.company_user_email_active_idx;

DROP INDEX IF EXISTS public.company_user_email_key;

DROP INDEX IF EXISTS public.company_user_phone_key;

DROP INDEX IF EXISTS public.idx_company_user_active_status;

DROP INDEX IF EXISTS public.idx_company_user_deleted_at;

DROP INDEX IF EXISTS public.idx_company_user_id;

DROP INDEX IF EXISTS public.idx_company_user_user_entity_type;

DROP TRIGGER IF EXISTS trg_update_feedback ON public.feedbacks;

DROP FUNCTION IF EXISTS public.update_feedback_updated_at();
`);
};

exports.down = () => {
  // Intentionally empty. See header.
};
