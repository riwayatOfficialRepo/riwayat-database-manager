/**
 * Sync with production: columns, keys, indexes and triggers on tables that already exist in master
 *
 * Part of the production schema sync. Generated from a read-only schema dump of the shared
 * dev/production database (2026-10-17) and compared with a database built from master.
 * Every statement is guarded: on production (where these objects already exist) it does nothing;
 * on a fresh database it recreates what production has.
 * down() is intentionally a no-op so that migrate:down can never drop live tables or data.
 * 
 * Adds production-only columns, aligns column types/defaults/nullability, and adds production-only keys, indexes and triggers.
 * Each change checks the current definition first and is skipped when it already matches production.
 */

exports.up = (pgm) => {
  pgm.sql(String.raw`
ALTER TABLE public.case_activity ADD COLUMN IF NOT EXISTS actor_details jsonb;

ALTER TABLE public.case_activity ADD COLUMN IF NOT EXISTS visibility case_activity_visibility DEFAULT 'INTERNAL'::case_activity_visibility NOT NULL;

ALTER TABLE public.cases ADD COLUMN IF NOT EXISTS assigned_dc_user uuid;

ALTER TABLE public.cases ADD COLUMN IF NOT EXISTS assigned_dc_user_at timestamp with time zone;

ALTER TABLE public.cases ADD COLUMN IF NOT EXISTS assigned_dc_user_details jsonb;

ALTER TABLE public.cases ADD COLUMN IF NOT EXISTS assigned_team_user uuid;

ALTER TABLE public.cases ADD COLUMN IF NOT EXISTS assigned_team_user_at timestamp with time zone;

ALTER TABLE public.cases ADD COLUMN IF NOT EXISTS assigned_team_user_details jsonb;

ALTER TABLE public.cases ADD COLUMN IF NOT EXISTS dedupe_hash character varying(64) DEFAULT NULL::character varying;

ALTER TABLE public.cases ADD COLUMN IF NOT EXISTS deleted_at timestamp with time zone;

ALTER TABLE public.cases ADD COLUMN IF NOT EXISTS forwarded_to uuid;

ALTER TABLE public.cases ADD COLUMN IF NOT EXISTS forwarded_to_type character varying(50) DEFAULT NULL::character varying;

ALTER TABLE public.cases ADD COLUMN IF NOT EXISTS initiated_by_details jsonb;

ALTER TABLE public.cases ADD COLUMN IF NOT EXISTS initiator_detail jsonb;

ALTER TABLE public.cases ADD COLUMN IF NOT EXISTS is_internal boolean DEFAULT false NOT NULL;

ALTER TABLE public.cases ADD COLUMN IF NOT EXISTS primary_entity_business_reference character varying(100);

ALTER TABLE public.cases ADD COLUMN IF NOT EXISTS raised_on_behalf_details jsonb;

ALTER TABLE public.company_user ADD COLUMN IF NOT EXISTS company_business_ref character varying(50);

ALTER TABLE public.company_user ADD COLUMN IF NOT EXISTS company_id uuid;

ALTER TABLE public.company_user_permissions ADD COLUMN IF NOT EXISTS status character varying(20) DEFAULT 'ACTIVE'::character varying NOT NULL;

ALTER TABLE public.company_user_pin ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid() NOT NULL;

ALTER TABLE public.dish_media ADD COLUMN IF NOT EXISTS request_detail jsonb;

ALTER TABLE public.event_log ADD COLUMN IF NOT EXISTS error text;

ALTER TABLE public.event_log ADD COLUMN IF NOT EXISTS processed_at timestamp with time zone;

ALTER TABLE public.event_log ADD COLUMN IF NOT EXISTS retry_count integer DEFAULT 0 NOT NULL;

ALTER TABLE public.kitchen_media ADD COLUMN IF NOT EXISTS request_detail jsonb;

ALTER TABLE public.rider_media ADD COLUMN IF NOT EXISTS created_by uuid;

ALTER TABLE public.rider_media ADD COLUMN IF NOT EXISTS media_id uuid DEFAULT gen_random_uuid() NOT NULL;

ALTER TABLE public.rider_media ADD COLUMN IF NOT EXISTS notes text;

ALTER TABLE public.rider_media ADD COLUMN IF NOT EXISTS s3_url text;

ALTER TABLE public.rider_media ADD COLUMN IF NOT EXISTS verified_by uuid;

-- audit_logs.output
DO $sync$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_attribute a WHERE a.attrelid = to_regclass('public.audit_logs') AND a.attname = 'output' AND NOT a.attisdropped AND format_type(a.atttypid, a.atttypmod) <> 'character varying(50)') THEN
ALTER TABLE public.audit_logs ALTER COLUMN output DROP DEFAULT;
ALTER TABLE public.audit_logs ALTER COLUMN output TYPE character varying(50) USING output::text::character varying(50);
  END IF;
END
$sync$;
DO $sync$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_attribute a WHERE a.attrelid = to_regclass('public.audit_logs') AND a.attname = 'output' AND NOT a.attisdropped AND COALESCE(pg_get_expr((SELECT d.adbin FROM pg_attrdef d WHERE d.adrelid = a.attrelid AND d.adnum = a.attnum), a.attrelid), '') <> '') THEN
ALTER TABLE public.audit_logs ALTER COLUMN output DROP DEFAULT;
  END IF;
END
$sync$;

-- cases.case_category
DO $sync$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_attribute a WHERE a.attrelid = to_regclass('public.cases') AND a.attname = 'case_category' AND NOT a.attisdropped AND format_type(a.atttypid, a.atttypmod) <> 'character varying(100)') THEN
ALTER TABLE public.cases ALTER COLUMN case_category DROP DEFAULT;
ALTER TABLE public.cases ALTER COLUMN case_category TYPE character varying(100) USING case_category::text::character varying(100);
  END IF;
END
$sync$;
DO $sync$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_attribute a WHERE a.attrelid = to_regclass('public.cases') AND a.attname = 'case_category' AND NOT a.attisdropped AND COALESCE(pg_get_expr((SELECT d.adbin FROM pg_attrdef d WHERE d.adrelid = a.attrelid AND d.adnum = a.attnum), a.attrelid), '') <> '') THEN
ALTER TABLE public.cases ALTER COLUMN case_category DROP DEFAULT;
  END IF;
END
$sync$;
DO $sync$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_attribute a WHERE a.attrelid = to_regclass('public.cases') AND a.attname = 'case_category' AND NOT a.attisdropped AND a.attnotnull <> true) THEN
ALTER TABLE public.cases ALTER COLUMN case_category SET NOT NULL;
  END IF;
END
$sync$;

-- cases.case_id
DO $sync$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_attribute a WHERE a.attrelid = to_regclass('public.cases') AND a.attname = 'case_id' AND NOT a.attisdropped AND COALESCE(pg_get_expr((SELECT d.adbin FROM pg_attrdef d WHERE d.adrelid = a.attrelid AND d.adnum = a.attnum), a.attrelid), '') <> 'gen_random_uuid()') THEN
ALTER TABLE public.cases ALTER COLUMN case_id SET DEFAULT gen_random_uuid();
  END IF;
END
$sync$;

-- cases.case_number
DO $sync$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_attribute a WHERE a.attrelid = to_regclass('public.cases') AND a.attname = 'case_number' AND NOT a.attisdropped AND format_type(a.atttypid, a.atttypmod) <> 'character varying(50)') THEN
ALTER TABLE public.cases ALTER COLUMN case_number DROP DEFAULT;
ALTER TABLE public.cases ALTER COLUMN case_number TYPE character varying(50) USING case_number::text::character varying(50);
  END IF;
END
$sync$;
DO $sync$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_attribute a WHERE a.attrelid = to_regclass('public.cases') AND a.attname = 'case_number' AND NOT a.attisdropped AND COALESCE(pg_get_expr((SELECT d.adbin FROM pg_attrdef d WHERE d.adrelid = a.attrelid AND d.adnum = a.attnum), a.attrelid), '') <> '') THEN
ALTER TABLE public.cases ALTER COLUMN case_number DROP DEFAULT;
  END IF;
END
$sync$;

-- cases.case_subtype
DO $sync$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_attribute a WHERE a.attrelid = to_regclass('public.cases') AND a.attname = 'case_subtype' AND NOT a.attisdropped AND format_type(a.atttypid, a.atttypmod) <> 'character varying(100)') THEN
ALTER TABLE public.cases ALTER COLUMN case_subtype DROP DEFAULT;
ALTER TABLE public.cases ALTER COLUMN case_subtype TYPE character varying(100) USING case_subtype::text::character varying(100);
  END IF;
END
$sync$;
DO $sync$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_attribute a WHERE a.attrelid = to_regclass('public.cases') AND a.attname = 'case_subtype' AND NOT a.attisdropped AND COALESCE(pg_get_expr((SELECT d.adbin FROM pg_attrdef d WHERE d.adrelid = a.attrelid AND d.adnum = a.attnum), a.attrelid), '') <> '') THEN
ALTER TABLE public.cases ALTER COLUMN case_subtype DROP DEFAULT;
  END IF;
END
$sync$;
DO $sync$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_attribute a WHERE a.attrelid = to_regclass('public.cases') AND a.attname = 'case_subtype' AND NOT a.attisdropped AND a.attnotnull <> true) THEN
ALTER TABLE public.cases ALTER COLUMN case_subtype SET NOT NULL;
  END IF;
END
$sync$;

-- cases.case_type
DO $sync$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_attribute a WHERE a.attrelid = to_regclass('public.cases') AND a.attname = 'case_type' AND NOT a.attisdropped AND format_type(a.atttypid, a.atttypmod) <> 'character varying(100)') THEN
ALTER TABLE public.cases ALTER COLUMN case_type DROP DEFAULT;
ALTER TABLE public.cases ALTER COLUMN case_type TYPE character varying(100) USING case_type::text::character varying(100);
  END IF;
END
$sync$;
DO $sync$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_attribute a WHERE a.attrelid = to_regclass('public.cases') AND a.attname = 'case_type' AND NOT a.attisdropped AND COALESCE(pg_get_expr((SELECT d.adbin FROM pg_attrdef d WHERE d.adrelid = a.attrelid AND d.adnum = a.attnum), a.attrelid), '') <> '') THEN
ALTER TABLE public.cases ALTER COLUMN case_type DROP DEFAULT;
  END IF;
END
$sync$;
DO $sync$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_attribute a WHERE a.attrelid = to_regclass('public.cases') AND a.attname = 'case_type' AND NOT a.attisdropped AND a.attnotnull <> true) THEN
ALTER TABLE public.cases ALTER COLUMN case_type SET NOT NULL;
  END IF;
END
$sync$;

-- cases.created_at
DO $sync$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_attribute a WHERE a.attrelid = to_regclass('public.cases') AND a.attname = 'created_at' AND NOT a.attisdropped AND a.attnotnull <> true) THEN
ALTER TABLE public.cases ALTER COLUMN created_at SET NOT NULL;
  END IF;
END
$sync$;

-- cases.idempotency_key
DO $sync$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_attribute a WHERE a.attrelid = to_regclass('public.cases') AND a.attname = 'idempotency_key' AND NOT a.attisdropped AND format_type(a.atttypid, a.atttypmod) <> 'character varying(255)') THEN
ALTER TABLE public.cases ALTER COLUMN idempotency_key DROP DEFAULT;
ALTER TABLE public.cases ALTER COLUMN idempotency_key TYPE character varying(255) USING idempotency_key::text::character varying(255);
  END IF;
END
$sync$;
DO $sync$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_attribute a WHERE a.attrelid = to_regclass('public.cases') AND a.attname = 'idempotency_key' AND NOT a.attisdropped AND COALESCE(pg_get_expr((SELECT d.adbin FROM pg_attrdef d WHERE d.adrelid = a.attrelid AND d.adnum = a.attnum), a.attrelid), '') <> 'NULL::character varying') THEN
ALTER TABLE public.cases ALTER COLUMN idempotency_key SET DEFAULT NULL::character varying;
  END IF;
END
$sync$;

-- cases.initiated_by_role
DO $sync$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_attribute a WHERE a.attrelid = to_regclass('public.cases') AND a.attname = 'initiated_by_role' AND NOT a.attisdropped AND format_type(a.atttypid, a.atttypmod) <> 'character varying(50)') THEN
ALTER TABLE public.cases ALTER COLUMN initiated_by_role DROP DEFAULT;
ALTER TABLE public.cases ALTER COLUMN initiated_by_role TYPE character varying(50) USING initiated_by_role::text::character varying(50);
  END IF;
END
$sync$;
DO $sync$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_attribute a WHERE a.attrelid = to_regclass('public.cases') AND a.attname = 'initiated_by_role' AND NOT a.attisdropped AND COALESCE(pg_get_expr((SELECT d.adbin FROM pg_attrdef d WHERE d.adrelid = a.attrelid AND d.adnum = a.attnum), a.attrelid), '') <> '') THEN
ALTER TABLE public.cases ALTER COLUMN initiated_by_role DROP DEFAULT;
  END IF;
END
$sync$;
DO $sync$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_attribute a WHERE a.attrelid = to_regclass('public.cases') AND a.attname = 'initiated_by_role' AND NOT a.attisdropped AND a.attnotnull <> false) THEN
ALTER TABLE public.cases ALTER COLUMN initiated_by_role DROP NOT NULL;
  END IF;
END
$sync$;

-- cases.primary_entity_id
DO $sync$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_attribute a WHERE a.attrelid = to_regclass('public.cases') AND a.attname = 'primary_entity_id' AND NOT a.attisdropped AND a.attnotnull <> false) THEN
ALTER TABLE public.cases ALTER COLUMN primary_entity_id DROP NOT NULL;
  END IF;
END
$sync$;

-- cases.primary_entity_type
DO $sync$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_attribute a WHERE a.attrelid = to_regclass('public.cases') AND a.attname = 'primary_entity_type' AND NOT a.attisdropped AND format_type(a.atttypid, a.atttypmod) <> 'character varying(50)') THEN
ALTER TABLE public.cases ALTER COLUMN primary_entity_type DROP DEFAULT;
ALTER TABLE public.cases ALTER COLUMN primary_entity_type TYPE character varying(50) USING primary_entity_type::text::character varying(50);
  END IF;
END
$sync$;
DO $sync$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_attribute a WHERE a.attrelid = to_regclass('public.cases') AND a.attname = 'primary_entity_type' AND NOT a.attisdropped AND COALESCE(pg_get_expr((SELECT d.adbin FROM pg_attrdef d WHERE d.adrelid = a.attrelid AND d.adnum = a.attnum), a.attrelid), '') <> '') THEN
ALTER TABLE public.cases ALTER COLUMN primary_entity_type DROP DEFAULT;
  END IF;
END
$sync$;
DO $sync$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_attribute a WHERE a.attrelid = to_regclass('public.cases') AND a.attname = 'primary_entity_type' AND NOT a.attisdropped AND a.attnotnull <> false) THEN
ALTER TABLE public.cases ALTER COLUMN primary_entity_type DROP NOT NULL;
  END IF;
END
$sync$;

-- cases.priority
DO $sync$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_attribute a WHERE a.attrelid = to_regclass('public.cases') AND a.attname = 'priority' AND NOT a.attisdropped AND COALESCE(pg_get_expr((SELECT d.adbin FROM pg_attrdef d WHERE d.adrelid = a.attrelid AND d.adnum = a.attnum), a.attrelid), '') <> 'NULL::character varying') THEN
ALTER TABLE public.cases ALTER COLUMN priority SET DEFAULT NULL::character varying;
  END IF;
END
$sync$;
DO $sync$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_attribute a WHERE a.attrelid = to_regclass('public.cases') AND a.attname = 'priority' AND NOT a.attisdropped AND a.attnotnull <> false) THEN
ALTER TABLE public.cases ALTER COLUMN priority DROP NOT NULL;
  END IF;
END
$sync$;

-- cases.status
DO $sync$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_attribute a WHERE a.attrelid = to_regclass('public.cases') AND a.attname = 'status' AND NOT a.attisdropped AND format_type(a.atttypid, a.atttypmod) <> 'character varying(50)') THEN
ALTER TABLE public.cases ALTER COLUMN status DROP DEFAULT;
ALTER TABLE public.cases ALTER COLUMN status TYPE character varying(50) USING status::text::character varying(50);
  END IF;
END
$sync$;
DO $sync$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_attribute a WHERE a.attrelid = to_regclass('public.cases') AND a.attname = 'status' AND NOT a.attisdropped AND COALESCE(pg_get_expr((SELECT d.adbin FROM pg_attrdef d WHERE d.adrelid = a.attrelid AND d.adnum = a.attnum), a.attrelid), '') <> '') THEN
ALTER TABLE public.cases ALTER COLUMN status DROP DEFAULT;
  END IF;
END
$sync$;

-- cases.title
DO $sync$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_attribute a WHERE a.attrelid = to_regclass('public.cases') AND a.attname = 'title' AND NOT a.attisdropped AND COALESCE(pg_get_expr((SELECT d.adbin FROM pg_attrdef d WHERE d.adrelid = a.attrelid AND d.adnum = a.attnum), a.attrelid), '') <> 'NULL::character varying') THEN
ALTER TABLE public.cases ALTER COLUMN title SET DEFAULT NULL::character varying;
  END IF;
END
$sync$;
DO $sync$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_attribute a WHERE a.attrelid = to_regclass('public.cases') AND a.attname = 'title' AND NOT a.attisdropped AND a.attnotnull <> false) THEN
ALTER TABLE public.cases ALTER COLUMN title DROP NOT NULL;
  END IF;
END
$sync$;

-- cases.updated_at
DO $sync$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_attribute a WHERE a.attrelid = to_regclass('public.cases') AND a.attname = 'updated_at' AND NOT a.attisdropped AND COALESCE(pg_get_expr((SELECT d.adbin FROM pg_attrdef d WHERE d.adrelid = a.attrelid AND d.adnum = a.attnum), a.attrelid), '') <> 'now()') THEN
ALTER TABLE public.cases ALTER COLUMN updated_at SET DEFAULT now();
  END IF;
END
$sync$;
DO $sync$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_attribute a WHERE a.attrelid = to_regclass('public.cases') AND a.attname = 'updated_at' AND NOT a.attisdropped AND a.attnotnull <> true) THEN
ALTER TABLE public.cases ALTER COLUMN updated_at SET NOT NULL;
  END IF;
END
$sync$;

-- companies.created_at
DO $sync$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_attribute a WHERE a.attrelid = to_regclass('public.companies') AND a.attname = 'created_at' AND NOT a.attisdropped AND format_type(a.atttypid, a.atttypmod) <> 'timestamp without time zone') THEN
ALTER TABLE public.companies ALTER COLUMN created_at DROP DEFAULT;
ALTER TABLE public.companies ALTER COLUMN created_at TYPE timestamp without time zone USING created_at::text::timestamp without time zone;
  END IF;
END
$sync$;
DO $sync$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_attribute a WHERE a.attrelid = to_regclass('public.companies') AND a.attname = 'created_at' AND NOT a.attisdropped AND COALESCE(pg_get_expr((SELECT d.adbin FROM pg_attrdef d WHERE d.adrelid = a.attrelid AND d.adnum = a.attnum), a.attrelid), '') <> 'now()') THEN
ALTER TABLE public.companies ALTER COLUMN created_at SET DEFAULT now();
  END IF;
END
$sync$;

-- companies.name
DO $sync$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_attribute a WHERE a.attrelid = to_regclass('public.companies') AND a.attname = 'name' AND NOT a.attisdropped AND format_type(a.atttypid, a.atttypmod) <> 'character varying(100)') THEN
ALTER TABLE public.companies ALTER COLUMN name DROP DEFAULT;
ALTER TABLE public.companies ALTER COLUMN name TYPE character varying(100) USING name::text::character varying(100);
  END IF;
END
$sync$;
DO $sync$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_attribute a WHERE a.attrelid = to_regclass('public.companies') AND a.attname = 'name' AND NOT a.attisdropped AND COALESCE(pg_get_expr((SELECT d.adbin FROM pg_attrdef d WHERE d.adrelid = a.attrelid AND d.adnum = a.attnum), a.attrelid), '') <> '') THEN
ALTER TABLE public.companies ALTER COLUMN name DROP DEFAULT;
  END IF;
END
$sync$;

-- companies.primary_contact_name
DO $sync$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_attribute a WHERE a.attrelid = to_regclass('public.companies') AND a.attname = 'primary_contact_name' AND NOT a.attisdropped AND format_type(a.atttypid, a.atttypmod) <> 'character varying(100)') THEN
ALTER TABLE public.companies ALTER COLUMN primary_contact_name DROP DEFAULT;
ALTER TABLE public.companies ALTER COLUMN primary_contact_name TYPE character varying(100) USING primary_contact_name::text::character varying(100);
  END IF;
END
$sync$;
DO $sync$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_attribute a WHERE a.attrelid = to_regclass('public.companies') AND a.attname = 'primary_contact_name' AND NOT a.attisdropped AND COALESCE(pg_get_expr((SELECT d.adbin FROM pg_attrdef d WHERE d.adrelid = a.attrelid AND d.adnum = a.attnum), a.attrelid), '') <> '') THEN
ALTER TABLE public.companies ALTER COLUMN primary_contact_name DROP DEFAULT;
  END IF;
END
$sync$;

-- companies.primary_email
DO $sync$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_attribute a WHERE a.attrelid = to_regclass('public.companies') AND a.attname = 'primary_email' AND NOT a.attisdropped AND format_type(a.atttypid, a.atttypmod) <> 'character varying(150)') THEN
ALTER TABLE public.companies ALTER COLUMN primary_email DROP DEFAULT;
ALTER TABLE public.companies ALTER COLUMN primary_email TYPE character varying(150) USING primary_email::text::character varying(150);
  END IF;
END
$sync$;
DO $sync$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_attribute a WHERE a.attrelid = to_regclass('public.companies') AND a.attname = 'primary_email' AND NOT a.attisdropped AND COALESCE(pg_get_expr((SELECT d.adbin FROM pg_attrdef d WHERE d.adrelid = a.attrelid AND d.adnum = a.attnum), a.attrelid), '') <> '') THEN
ALTER TABLE public.companies ALTER COLUMN primary_email DROP DEFAULT;
  END IF;
END
$sync$;

-- companies.primary_phone
DO $sync$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_attribute a WHERE a.attrelid = to_regclass('public.companies') AND a.attname = 'primary_phone' AND NOT a.attisdropped AND format_type(a.atttypid, a.atttypmod) <> 'character varying(20)') THEN
ALTER TABLE public.companies ALTER COLUMN primary_phone DROP DEFAULT;
ALTER TABLE public.companies ALTER COLUMN primary_phone TYPE character varying(20) USING primary_phone::text::character varying(20);
  END IF;
END
$sync$;
DO $sync$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_attribute a WHERE a.attrelid = to_regclass('public.companies') AND a.attname = 'primary_phone' AND NOT a.attisdropped AND COALESCE(pg_get_expr((SELECT d.adbin FROM pg_attrdef d WHERE d.adrelid = a.attrelid AND d.adnum = a.attnum), a.attrelid), '') <> '') THEN
ALTER TABLE public.companies ALTER COLUMN primary_phone DROP DEFAULT;
  END IF;
END
$sync$;

-- companies.status
DO $sync$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_attribute a WHERE a.attrelid = to_regclass('public.companies') AND a.attname = 'status' AND NOT a.attisdropped AND format_type(a.atttypid, a.atttypmod) <> 'character varying(20)') THEN
ALTER TABLE public.companies ALTER COLUMN status DROP DEFAULT;
ALTER TABLE public.companies ALTER COLUMN status TYPE character varying(20) USING status::text::character varying(20);
  END IF;
END
$sync$;
DO $sync$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_attribute a WHERE a.attrelid = to_regclass('public.companies') AND a.attname = 'status' AND NOT a.attisdropped AND COALESCE(pg_get_expr((SELECT d.adbin FROM pg_attrdef d WHERE d.adrelid = a.attrelid AND d.adnum = a.attnum), a.attrelid), '') <> '''active''::character varying') THEN
ALTER TABLE public.companies ALTER COLUMN status SET DEFAULT 'active'::character varying;
  END IF;
END
$sync$;

-- companies.updated_at
DO $sync$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_attribute a WHERE a.attrelid = to_regclass('public.companies') AND a.attname = 'updated_at' AND NOT a.attisdropped AND format_type(a.atttypid, a.atttypmod) <> 'timestamp without time zone') THEN
ALTER TABLE public.companies ALTER COLUMN updated_at DROP DEFAULT;
ALTER TABLE public.companies ALTER COLUMN updated_at TYPE timestamp without time zone USING updated_at::text::timestamp without time zone;
  END IF;
END
$sync$;
DO $sync$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_attribute a WHERE a.attrelid = to_regclass('public.companies') AND a.attname = 'updated_at' AND NOT a.attisdropped AND COALESCE(pg_get_expr((SELECT d.adbin FROM pg_attrdef d WHERE d.adrelid = a.attrelid AND d.adnum = a.attnum), a.attrelid), '') <> 'now()') THEN
ALTER TABLE public.companies ALTER COLUMN updated_at SET DEFAULT now();
  END IF;
END
$sync$;

-- companies.website
DO $sync$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_attribute a WHERE a.attrelid = to_regclass('public.companies') AND a.attname = 'website' AND NOT a.attisdropped AND format_type(a.atttypid, a.atttypmod) <> 'character varying(255)') THEN
ALTER TABLE public.companies ALTER COLUMN website DROP DEFAULT;
ALTER TABLE public.companies ALTER COLUMN website TYPE character varying(255) USING website::text::character varying(255);
  END IF;
END
$sync$;
DO $sync$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_attribute a WHERE a.attrelid = to_regclass('public.companies') AND a.attname = 'website' AND NOT a.attisdropped AND COALESCE(pg_get_expr((SELECT d.adbin FROM pg_attrdef d WHERE d.adrelid = a.attrelid AND d.adnum = a.attnum), a.attrelid), '') <> '') THEN
ALTER TABLE public.companies ALTER COLUMN website DROP DEFAULT;
  END IF;
END
$sync$;

-- company_user.business_reference
DO $sync$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_attribute a WHERE a.attrelid = to_regclass('public.company_user') AND a.attname = 'business_reference' AND NOT a.attisdropped AND format_type(a.atttypid, a.atttypmod) <> 'character varying(50)') THEN
ALTER TABLE public.company_user ALTER COLUMN business_reference DROP DEFAULT;
ALTER TABLE public.company_user ALTER COLUMN business_reference TYPE character varying(50) USING business_reference::text::character varying(50);
  END IF;
END
$sync$;
DO $sync$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_attribute a WHERE a.attrelid = to_regclass('public.company_user') AND a.attname = 'business_reference' AND NOT a.attisdropped AND COALESCE(pg_get_expr((SELECT d.adbin FROM pg_attrdef d WHERE d.adrelid = a.attrelid AND d.adnum = a.attnum), a.attrelid), '') <> '') THEN
ALTER TABLE public.company_user ALTER COLUMN business_reference DROP DEFAULT;
  END IF;
END
$sync$;

-- company_user.created_at
DO $sync$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_attribute a WHERE a.attrelid = to_regclass('public.company_user') AND a.attname = 'created_at' AND NOT a.attisdropped AND a.attnotnull <> true) THEN
ALTER TABLE public.company_user ALTER COLUMN created_at SET NOT NULL;
  END IF;
END
$sync$;

-- company_user.email
DO $sync$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_attribute a WHERE a.attrelid = to_regclass('public.company_user') AND a.attname = 'email' AND NOT a.attisdropped AND format_type(a.atttypid, a.atttypmod) <> 'character varying(150)') THEN
ALTER TABLE public.company_user ALTER COLUMN email DROP DEFAULT;
ALTER TABLE public.company_user ALTER COLUMN email TYPE character varying(150) USING email::text::character varying(150);
  END IF;
END
$sync$;
DO $sync$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_attribute a WHERE a.attrelid = to_regclass('public.company_user') AND a.attname = 'email' AND NOT a.attisdropped AND COALESCE(pg_get_expr((SELECT d.adbin FROM pg_attrdef d WHERE d.adrelid = a.attrelid AND d.adnum = a.attnum), a.attrelid), '') <> '') THEN
ALTER TABLE public.company_user ALTER COLUMN email DROP DEFAULT;
  END IF;
END
$sync$;
DO $sync$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_attribute a WHERE a.attrelid = to_regclass('public.company_user') AND a.attname = 'email' AND NOT a.attisdropped AND a.attnotnull <> false) THEN
ALTER TABLE public.company_user ALTER COLUMN email DROP NOT NULL;
  END IF;
END
$sync$;

-- company_user.id
DO $sync$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_attribute a WHERE a.attrelid = to_regclass('public.company_user') AND a.attname = 'id' AND NOT a.attisdropped AND COALESCE(pg_get_expr((SELECT d.adbin FROM pg_attrdef d WHERE d.adrelid = a.attrelid AND d.adnum = a.attnum), a.attrelid), '') <> 'gen_random_uuid()') THEN
ALTER TABLE public.company_user ALTER COLUMN id SET DEFAULT gen_random_uuid();
  END IF;
END
$sync$;

-- company_user.is_active
DO $sync$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_attribute a WHERE a.attrelid = to_regclass('public.company_user') AND a.attname = 'is_active' AND NOT a.attisdropped AND COALESCE(pg_get_expr((SELECT d.adbin FROM pg_attrdef d WHERE d.adrelid = a.attrelid AND d.adnum = a.attnum), a.attrelid), '') <> 'false') THEN
ALTER TABLE public.company_user ALTER COLUMN is_active SET DEFAULT false;
  END IF;
END
$sync$;
DO $sync$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_attribute a WHERE a.attrelid = to_regclass('public.company_user') AND a.attname = 'is_active' AND NOT a.attisdropped AND a.attnotnull <> true) THEN
ALTER TABLE public.company_user ALTER COLUMN is_active SET NOT NULL;
  END IF;
END
$sync$;

-- company_user.name
DO $sync$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_attribute a WHERE a.attrelid = to_regclass('public.company_user') AND a.attname = 'name' AND NOT a.attisdropped AND format_type(a.atttypid, a.atttypmod) <> 'character varying(100)') THEN
ALTER TABLE public.company_user ALTER COLUMN name DROP DEFAULT;
ALTER TABLE public.company_user ALTER COLUMN name TYPE character varying(100) USING name::text::character varying(100);
  END IF;
END
$sync$;
DO $sync$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_attribute a WHERE a.attrelid = to_regclass('public.company_user') AND a.attname = 'name' AND NOT a.attisdropped AND COALESCE(pg_get_expr((SELECT d.adbin FROM pg_attrdef d WHERE d.adrelid = a.attrelid AND d.adnum = a.attnum), a.attrelid), '') <> '') THEN
ALTER TABLE public.company_user ALTER COLUMN name DROP DEFAULT;
  END IF;
END
$sync$;

-- company_user.password_hash
DO $sync$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_attribute a WHERE a.attrelid = to_regclass('public.company_user') AND a.attname = 'password_hash' AND NOT a.attisdropped AND format_type(a.atttypid, a.atttypmod) <> 'character varying(255)') THEN
ALTER TABLE public.company_user ALTER COLUMN password_hash DROP DEFAULT;
ALTER TABLE public.company_user ALTER COLUMN password_hash TYPE character varying(255) USING password_hash::text::character varying(255);
  END IF;
END
$sync$;
DO $sync$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_attribute a WHERE a.attrelid = to_regclass('public.company_user') AND a.attname = 'password_hash' AND NOT a.attisdropped AND COALESCE(pg_get_expr((SELECT d.adbin FROM pg_attrdef d WHERE d.adrelid = a.attrelid AND d.adnum = a.attnum), a.attrelid), '') <> '') THEN
ALTER TABLE public.company_user ALTER COLUMN password_hash DROP DEFAULT;
  END IF;
END
$sync$;
DO $sync$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_attribute a WHERE a.attrelid = to_regclass('public.company_user') AND a.attname = 'password_hash' AND NOT a.attisdropped AND a.attnotnull <> false) THEN
ALTER TABLE public.company_user ALTER COLUMN password_hash DROP NOT NULL;
  END IF;
END
$sync$;

-- company_user.phone
DO $sync$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_attribute a WHERE a.attrelid = to_regclass('public.company_user') AND a.attname = 'phone' AND NOT a.attisdropped AND format_type(a.atttypid, a.atttypmod) <> 'character varying(20)') THEN
ALTER TABLE public.company_user ALTER COLUMN phone DROP DEFAULT;
ALTER TABLE public.company_user ALTER COLUMN phone TYPE character varying(20) USING phone::text::character varying(20);
  END IF;
END
$sync$;
DO $sync$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_attribute a WHERE a.attrelid = to_regclass('public.company_user') AND a.attname = 'phone' AND NOT a.attisdropped AND COALESCE(pg_get_expr((SELECT d.adbin FROM pg_attrdef d WHERE d.adrelid = a.attrelid AND d.adnum = a.attnum), a.attrelid), '') <> '') THEN
ALTER TABLE public.company_user ALTER COLUMN phone DROP DEFAULT;
  END IF;
END
$sync$;

-- company_user.status
DO $sync$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_attribute a WHERE a.attrelid = to_regclass('public.company_user') AND a.attname = 'status' AND NOT a.attisdropped AND format_type(a.atttypid, a.atttypmod) <> 'character varying(20)') THEN
ALTER TABLE public.company_user ALTER COLUMN status DROP DEFAULT;
ALTER TABLE public.company_user ALTER COLUMN status TYPE character varying(20) USING status::text::character varying(20);
  END IF;
END
$sync$;
DO $sync$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_attribute a WHERE a.attrelid = to_regclass('public.company_user') AND a.attname = 'status' AND NOT a.attisdropped AND COALESCE(pg_get_expr((SELECT d.adbin FROM pg_attrdef d WHERE d.adrelid = a.attrelid AND d.adnum = a.attnum), a.attrelid), '') <> '''INACTIVE''::character varying') THEN
ALTER TABLE public.company_user ALTER COLUMN status SET DEFAULT 'INACTIVE'::character varying;
  END IF;
END
$sync$;
DO $sync$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_attribute a WHERE a.attrelid = to_regclass('public.company_user') AND a.attname = 'status' AND NOT a.attisdropped AND a.attnotnull <> true) THEN
ALTER TABLE public.company_user ALTER COLUMN status SET NOT NULL;
  END IF;
END
$sync$;

-- company_user.updated_at
DO $sync$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_attribute a WHERE a.attrelid = to_regclass('public.company_user') AND a.attname = 'updated_at' AND NOT a.attisdropped AND a.attnotnull <> true) THEN
ALTER TABLE public.company_user ALTER COLUMN updated_at SET NOT NULL;
  END IF;
END
$sync$;

-- company_user.user_entity_type
DO $sync$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_attribute a WHERE a.attrelid = to_regclass('public.company_user') AND a.attname = 'user_entity_type' AND NOT a.attisdropped AND format_type(a.atttypid, a.atttypmod) <> 'character varying(50)') THEN
ALTER TABLE public.company_user ALTER COLUMN user_entity_type DROP DEFAULT;
ALTER TABLE public.company_user ALTER COLUMN user_entity_type TYPE character varying(50) USING user_entity_type::text::character varying(50);
  END IF;
END
$sync$;
DO $sync$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_attribute a WHERE a.attrelid = to_regclass('public.company_user') AND a.attname = 'user_entity_type' AND NOT a.attisdropped AND COALESCE(pg_get_expr((SELECT d.adbin FROM pg_attrdef d WHERE d.adrelid = a.attrelid AND d.adnum = a.attnum), a.attrelid), '') <> '') THEN
ALTER TABLE public.company_user ALTER COLUMN user_entity_type DROP DEFAULT;
  END IF;
END
$sync$;
DO $sync$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_attribute a WHERE a.attrelid = to_regclass('public.company_user') AND a.attname = 'user_entity_type' AND NOT a.attisdropped AND a.attnotnull <> false) THEN
ALTER TABLE public.company_user ALTER COLUMN user_entity_type DROP NOT NULL;
  END IF;
END
$sync$;

-- company_user_pin.pin_hash
DO $sync$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_attribute a WHERE a.attrelid = to_regclass('public.company_user_pin') AND a.attname = 'pin_hash' AND NOT a.attisdropped AND format_type(a.atttypid, a.atttypmod) <> 'character varying(255)') THEN
ALTER TABLE public.company_user_pin ALTER COLUMN pin_hash DROP DEFAULT;
ALTER TABLE public.company_user_pin ALTER COLUMN pin_hash TYPE character varying(255) USING pin_hash::text::character varying(255);
  END IF;
END
$sync$;
DO $sync$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_attribute a WHERE a.attrelid = to_regclass('public.company_user_pin') AND a.attname = 'pin_hash' AND NOT a.attisdropped AND COALESCE(pg_get_expr((SELECT d.adbin FROM pg_attrdef d WHERE d.adrelid = a.attrelid AND d.adnum = a.attnum), a.attrelid), '') <> '') THEN
ALTER TABLE public.company_user_pin ALTER COLUMN pin_hash DROP DEFAULT;
  END IF;
END
$sync$;

-- company_user_roles.assigned_at
DO $sync$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_attribute a WHERE a.attrelid = to_regclass('public.company_user_roles') AND a.attname = 'assigned_at' AND NOT a.attisdropped AND a.attnotnull <> true) THEN
ALTER TABLE public.company_user_roles ALTER COLUMN assigned_at SET NOT NULL;
  END IF;
END
$sync$;

-- dish_availability.status
DO $sync$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_attribute a WHERE a.attrelid = to_regclass('public.dish_availability') AND a.attname = 'status' AND NOT a.attisdropped AND COALESCE(pg_get_expr((SELECT d.adbin FROM pg_attrdef d WHERE d.adrelid = a.attrelid AND d.adnum = a.attnum), a.attrelid), '') <> '''ACTIVE''::character varying') THEN
ALTER TABLE public.dish_availability ALTER COLUMN status SET DEFAULT 'ACTIVE'::character varying;
  END IF;
END
$sync$;

-- dish_availability_staging.status
DO $sync$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_attribute a WHERE a.attrelid = to_regclass('public.dish_availability_staging') AND a.attname = 'status' AND NOT a.attisdropped AND COALESCE(pg_get_expr((SELECT d.adbin FROM pg_attrdef d WHERE d.adrelid = a.attrelid AND d.adnum = a.attnum), a.attrelid), '') <> '''DRAFT''::character varying') THEN
ALTER TABLE public.dish_availability_staging ALTER COLUMN status SET DEFAULT 'DRAFT'::character varying;
  END IF;
END
$sync$;

-- dish_categories.status
DO $sync$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_attribute a WHERE a.attrelid = to_regclass('public.dish_categories') AND a.attname = 'status' AND NOT a.attisdropped AND COALESCE(pg_get_expr((SELECT d.adbin FROM pg_attrdef d WHERE d.adrelid = a.attrelid AND d.adnum = a.attnum), a.attrelid), '') <> '''ACTIVE''::character varying') THEN
ALTER TABLE public.dish_categories ALTER COLUMN status SET DEFAULT 'ACTIVE'::character varying;
  END IF;
END
$sync$;

-- dish_cuisine_map.status
DO $sync$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_attribute a WHERE a.attrelid = to_regclass('public.dish_cuisine_map') AND a.attname = 'status' AND NOT a.attisdropped AND COALESCE(pg_get_expr((SELECT d.adbin FROM pg_attrdef d WHERE d.adrelid = a.attrelid AND d.adnum = a.attnum), a.attrelid), '') <> '''ACTIVE''::character varying') THEN
ALTER TABLE public.dish_cuisine_map ALTER COLUMN status SET DEFAULT 'ACTIVE'::character varying;
  END IF;
END
$sync$;

-- dish_cuisine_map_staging.status
DO $sync$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_attribute a WHERE a.attrelid = to_regclass('public.dish_cuisine_map_staging') AND a.attname = 'status' AND NOT a.attisdropped AND COALESCE(pg_get_expr((SELECT d.adbin FROM pg_attrdef d WHERE d.adrelid = a.attrelid AND d.adnum = a.attnum), a.attrelid), '') <> '''DRAFT''::character varying') THEN
ALTER TABLE public.dish_cuisine_map_staging ALTER COLUMN status SET DEFAULT 'DRAFT'::character varying;
  END IF;
END
$sync$;

-- dish_cuisines.status
DO $sync$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_attribute a WHERE a.attrelid = to_regclass('public.dish_cuisines') AND a.attname = 'status' AND NOT a.attisdropped AND COALESCE(pg_get_expr((SELECT d.adbin FROM pg_attrdef d WHERE d.adrelid = a.attrelid AND d.adnum = a.attnum), a.attrelid), '') <> '''ACTIVE''::character varying') THEN
ALTER TABLE public.dish_cuisines ALTER COLUMN status SET DEFAULT 'ACTIVE'::character varying;
  END IF;
END
$sync$;

-- dish_dietary_flags.status
DO $sync$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_attribute a WHERE a.attrelid = to_regclass('public.dish_dietary_flags') AND a.attname = 'status' AND NOT a.attisdropped AND COALESCE(pg_get_expr((SELECT d.adbin FROM pg_attrdef d WHERE d.adrelid = a.attrelid AND d.adnum = a.attnum), a.attrelid), '') <> '''ACTIVE''::character varying') THEN
ALTER TABLE public.dish_dietary_flags ALTER COLUMN status SET DEFAULT 'ACTIVE'::character varying;
  END IF;
END
$sync$;

-- dish_dietary_map.status
DO $sync$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_attribute a WHERE a.attrelid = to_regclass('public.dish_dietary_map') AND a.attname = 'status' AND NOT a.attisdropped AND COALESCE(pg_get_expr((SELECT d.adbin FROM pg_attrdef d WHERE d.adrelid = a.attrelid AND d.adnum = a.attnum), a.attrelid), '') <> '''ACTIVE''::character varying') THEN
ALTER TABLE public.dish_dietary_map ALTER COLUMN status SET DEFAULT 'ACTIVE'::character varying;
  END IF;
END
$sync$;

-- dish_dietary_map_staging.status
DO $sync$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_attribute a WHERE a.attrelid = to_regclass('public.dish_dietary_map_staging') AND a.attname = 'status' AND NOT a.attisdropped AND COALESCE(pg_get_expr((SELECT d.adbin FROM pg_attrdef d WHERE d.adrelid = a.attrelid AND d.adnum = a.attnum), a.attrelid), '') <> '''DRAFT''::character varying') THEN
ALTER TABLE public.dish_dietary_map_staging ALTER COLUMN status SET DEFAULT 'DRAFT'::character varying;
  END IF;
END
$sync$;

-- dish_tag_map.status
DO $sync$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_attribute a WHERE a.attrelid = to_regclass('public.dish_tag_map') AND a.attname = 'status' AND NOT a.attisdropped AND COALESCE(pg_get_expr((SELECT d.adbin FROM pg_attrdef d WHERE d.adrelid = a.attrelid AND d.adnum = a.attnum), a.attrelid), '') <> '''ACTIVE''::character varying') THEN
ALTER TABLE public.dish_tag_map ALTER COLUMN status SET DEFAULT 'ACTIVE'::character varying;
  END IF;
END
$sync$;

-- dish_tag_map_staging.status
DO $sync$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_attribute a WHERE a.attrelid = to_regclass('public.dish_tag_map_staging') AND a.attname = 'status' AND NOT a.attisdropped AND COALESCE(pg_get_expr((SELECT d.adbin FROM pg_attrdef d WHERE d.adrelid = a.attrelid AND d.adnum = a.attnum), a.attrelid), '') <> '''DRAFT''::character varying') THEN
ALTER TABLE public.dish_tag_map_staging ALTER COLUMN status SET DEFAULT 'DRAFT'::character varying;
  END IF;
END
$sync$;

-- dish_tags.status
DO $sync$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_attribute a WHERE a.attrelid = to_regclass('public.dish_tags') AND a.attname = 'status' AND NOT a.attisdropped AND COALESCE(pg_get_expr((SELECT d.adbin FROM pg_attrdef d WHERE d.adrelid = a.attrelid AND d.adnum = a.attnum), a.attrelid), '') <> '''ACTIVE''::character varying') THEN
ALTER TABLE public.dish_tags ALTER COLUMN status SET DEFAULT 'ACTIVE'::character varying;
  END IF;
END
$sync$;

-- rider_documents.document_type
DO $sync$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_attribute a WHERE a.attrelid = to_regclass('public.rider_documents') AND a.attname = 'document_type' AND NOT a.attisdropped AND format_type(a.atttypid, a.atttypmod) <> 'text') THEN
ALTER TABLE public.rider_documents ALTER COLUMN document_type DROP DEFAULT;
ALTER TABLE public.rider_documents ALTER COLUMN document_type TYPE text USING document_type::text::text;
  END IF;
END
$sync$;
DO $sync$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_attribute a WHERE a.attrelid = to_regclass('public.rider_documents') AND a.attname = 'document_type' AND NOT a.attisdropped AND COALESCE(pg_get_expr((SELECT d.adbin FROM pg_attrdef d WHERE d.adrelid = a.attrelid AND d.adnum = a.attnum), a.attrelid), '') <> '') THEN
ALTER TABLE public.rider_documents ALTER COLUMN document_type DROP DEFAULT;
  END IF;
END
$sync$;

-- rider_media.created_at
DO $sync$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_attribute a WHERE a.attrelid = to_regclass('public.rider_media') AND a.attname = 'created_at' AND NOT a.attisdropped AND format_type(a.atttypid, a.atttypmod) <> 'timestamp with time zone') THEN
ALTER TABLE public.rider_media ALTER COLUMN created_at DROP DEFAULT;
ALTER TABLE public.rider_media ALTER COLUMN created_at TYPE timestamp with time zone USING created_at::text::timestamp with time zone;
  END IF;
END
$sync$;
DO $sync$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_attribute a WHERE a.attrelid = to_regclass('public.rider_media') AND a.attname = 'created_at' AND NOT a.attisdropped AND COALESCE(pg_get_expr((SELECT d.adbin FROM pg_attrdef d WHERE d.adrelid = a.attrelid AND d.adnum = a.attnum), a.attrelid), '') <> 'now()') THEN
ALTER TABLE public.rider_media ALTER COLUMN created_at SET DEFAULT now();
  END IF;
END
$sync$;

-- rider_media.media_type
DO $sync$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_attribute a WHERE a.attrelid = to_regclass('public.rider_media') AND a.attname = 'media_type' AND NOT a.attisdropped AND format_type(a.atttypid, a.atttypmod) <> 'text') THEN
ALTER TABLE public.rider_media ALTER COLUMN media_type DROP DEFAULT;
ALTER TABLE public.rider_media ALTER COLUMN media_type TYPE text USING media_type::text::text;
  END IF;
END
$sync$;
DO $sync$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_attribute a WHERE a.attrelid = to_regclass('public.rider_media') AND a.attname = 'media_type' AND NOT a.attisdropped AND COALESCE(pg_get_expr((SELECT d.adbin FROM pg_attrdef d WHERE d.adrelid = a.attrelid AND d.adnum = a.attnum), a.attrelid), '') <> '') THEN
ALTER TABLE public.rider_media ALTER COLUMN media_type DROP DEFAULT;
  END IF;
END
$sync$;

-- rider_media.status
DO $sync$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_attribute a WHERE a.attrelid = to_regclass('public.rider_media') AND a.attname = 'status' AND NOT a.attisdropped AND format_type(a.atttypid, a.atttypmod) <> 'text') THEN
ALTER TABLE public.rider_media ALTER COLUMN status DROP DEFAULT;
ALTER TABLE public.rider_media ALTER COLUMN status TYPE text USING status::text::text;
  END IF;
END
$sync$;
DO $sync$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_attribute a WHERE a.attrelid = to_regclass('public.rider_media') AND a.attname = 'status' AND NOT a.attisdropped AND COALESCE(pg_get_expr((SELECT d.adbin FROM pg_attrdef d WHERE d.adrelid = a.attrelid AND d.adnum = a.attnum), a.attrelid), '') <> '''pending''::text') THEN
ALTER TABLE public.rider_media ALTER COLUMN status SET DEFAULT 'pending'::text;
  END IF;
END
$sync$;
DO $sync$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_attribute a WHERE a.attrelid = to_regclass('public.rider_media') AND a.attname = 'status' AND NOT a.attisdropped AND a.attnotnull <> true) THEN
ALTER TABLE public.rider_media ALTER COLUMN status SET NOT NULL;
  END IF;
END
$sync$;

-- rider_media.updated_at
DO $sync$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_attribute a WHERE a.attrelid = to_regclass('public.rider_media') AND a.attname = 'updated_at' AND NOT a.attisdropped AND format_type(a.atttypid, a.atttypmod) <> 'timestamp with time zone') THEN
ALTER TABLE public.rider_media ALTER COLUMN updated_at DROP DEFAULT;
ALTER TABLE public.rider_media ALTER COLUMN updated_at TYPE timestamp with time zone USING updated_at::text::timestamp with time zone;
  END IF;
END
$sync$;
DO $sync$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_attribute a WHERE a.attrelid = to_regclass('public.rider_media') AND a.attname = 'updated_at' AND NOT a.attisdropped AND COALESCE(pg_get_expr((SELECT d.adbin FROM pg_attrdef d WHERE d.adrelid = a.attrelid AND d.adnum = a.attnum), a.attrelid), '') <> 'now()') THEN
ALTER TABLE public.rider_media ALTER COLUMN updated_at SET DEFAULT now();
  END IF;
END
$sync$;

-- rider_vehicle.status
DO $sync$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_attribute a WHERE a.attrelid = to_regclass('public.rider_vehicle') AND a.attname = 'status' AND NOT a.attisdropped AND COALESCE(pg_get_expr((SELECT d.adbin FROM pg_attrdef d WHERE d.adrelid = a.attrelid AND d.adnum = a.attnum), a.attrelid), '') <> '''active''::text') THEN
ALTER TABLE public.rider_vehicle ALTER COLUMN status SET DEFAULT 'active'::text;
  END IF;
END
$sync$;

-- dish_categories: promote unique index dish_categories_name_key to a constraint
DO $sync$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'dish_categories_name_key' AND conrelid = to_regclass('public.dish_categories')) AND to_regclass('public.dish_categories_name_key') IS NOT NULL THEN
ALTER TABLE public.dish_categories ADD CONSTRAINT dish_categories_name_key UNIQUE USING INDEX dish_categories_name_key;
  END IF;
END
$sync$;

-- dish_cuisine_map: promote unique index dish_cuisine_map_dish_id_cuisine_id_key to a constraint
DO $sync$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'dish_cuisine_map_dish_id_cuisine_id_key' AND conrelid = to_regclass('public.dish_cuisine_map')) AND to_regclass('public.dish_cuisine_map_dish_id_cuisine_id_key') IS NOT NULL THEN
ALTER TABLE public.dish_cuisine_map ADD CONSTRAINT dish_cuisine_map_dish_id_cuisine_id_key UNIQUE USING INDEX dish_cuisine_map_dish_id_cuisine_id_key;
  END IF;
END
$sync$;

-- dish_cuisines: promote unique index dish_cuisines_name_key to a constraint
DO $sync$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'dish_cuisines_name_key' AND conrelid = to_regclass('public.dish_cuisines')) AND to_regclass('public.dish_cuisines_name_key') IS NOT NULL THEN
ALTER TABLE public.dish_cuisines ADD CONSTRAINT dish_cuisines_name_key UNIQUE USING INDEX dish_cuisines_name_key;
  END IF;
END
$sync$;

-- dish_dietary_flags: promote unique index dish_dietary_flags_name_key to a constraint
DO $sync$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'dish_dietary_flags_name_key' AND conrelid = to_regclass('public.dish_dietary_flags')) AND to_regclass('public.dish_dietary_flags_name_key') IS NOT NULL THEN
ALTER TABLE public.dish_dietary_flags ADD CONSTRAINT dish_dietary_flags_name_key UNIQUE USING INDEX dish_dietary_flags_name_key;
  END IF;
END
$sync$;

-- dish_dietary_map: promote unique index dish_dietary_map_dish_id_dietary_id_key to a constraint
DO $sync$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'dish_dietary_map_dish_id_dietary_id_key' AND conrelid = to_regclass('public.dish_dietary_map')) AND to_regclass('public.dish_dietary_map_dish_id_dietary_id_key') IS NOT NULL THEN
ALTER TABLE public.dish_dietary_map ADD CONSTRAINT dish_dietary_map_dish_id_dietary_id_key UNIQUE USING INDEX dish_dietary_map_dish_id_dietary_id_key;
  END IF;
END
$sync$;

-- dish_tag_map: promote unique index dish_tag_map_dish_id_tag_id_key to a constraint
DO $sync$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'dish_tag_map_dish_id_tag_id_key' AND conrelid = to_regclass('public.dish_tag_map')) AND to_regclass('public.dish_tag_map_dish_id_tag_id_key') IS NOT NULL THEN
ALTER TABLE public.dish_tag_map ADD CONSTRAINT dish_tag_map_dish_id_tag_id_key UNIQUE USING INDEX dish_tag_map_dish_id_tag_id_key;
  END IF;
END
$sync$;

-- dish_tags: promote unique index dish_tags_name_key to a constraint
DO $sync$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'dish_tags_name_key' AND conrelid = to_regclass('public.dish_tags')) AND to_regclass('public.dish_tags_name_key') IS NOT NULL THEN
ALTER TABLE public.dish_tags ADD CONSTRAINT dish_tags_name_key UNIQUE USING INDEX dish_tags_name_key;
  END IF;
END
$sync$;

-- company_user_pin: company_user_pin_pkey
DO $sync$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = to_regclass('public.company_user_pin') AND conname = 'company_user_pin_pkey' AND pg_get_constraintdef(oid) = 'PRIMARY KEY (id)') THEN
PERFORM 1 FROM pg_constraint WHERE conrelid = to_regclass('public.company_user_pin') AND contype = 'p';
IF FOUND THEN
  EXECUTE (SELECT 'ALTER TABLE public.company_user_pin DROP CONSTRAINT ' || quote_ident(conname) || ' CASCADE' FROM pg_constraint WHERE conrelid = to_regclass('public.company_user_pin') AND contype = 'p');
END IF;
ALTER TABLE public.company_user_pin ADD CONSTRAINT company_user_pin_pkey PRIMARY KEY (id);
  END IF;
END
$sync$;

-- rider_media: rider_media_pkey
DO $sync$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = to_regclass('public.rider_media') AND conname = 'rider_media_pkey' AND pg_get_constraintdef(oid) = 'PRIMARY KEY (media_id)') THEN
PERFORM 1 FROM pg_constraint WHERE conrelid = to_regclass('public.rider_media') AND contype = 'p';
IF FOUND THEN
  EXECUTE (SELECT 'ALTER TABLE public.rider_media DROP CONSTRAINT ' || quote_ident(conname) || ' CASCADE' FROM pg_constraint WHERE conrelid = to_regclass('public.rider_media') AND contype = 'p');
END IF;
ALTER TABLE public.rider_media ADD CONSTRAINT rider_media_pkey PRIMARY KEY (media_id);
  END IF;
END
$sync$;

-- cases: uq_cases_idempotency
DO $sync$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = to_regclass('public.cases') AND conname = 'uq_cases_idempotency' AND pg_get_constraintdef(oid) = 'UNIQUE (idempotency_key)') THEN
ALTER TABLE public.cases DROP CONSTRAINT IF EXISTS uq_cases_idempotency CASCADE;
ALTER TABLE public.cases ADD CONSTRAINT uq_cases_idempotency UNIQUE (idempotency_key);
  END IF;
END
$sync$;

-- companies: chk_companies_status
DO $sync$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = to_regclass('public.companies') AND conname = 'chk_companies_status' AND pg_get_constraintdef(oid) = 'CHECK (((status)::text = ANY ((ARRAY[''active''::character varying, ''inactive''::character varying])::text[])))') THEN
ALTER TABLE public.companies DROP CONSTRAINT IF EXISTS chk_companies_status CASCADE;
ALTER TABLE public.companies ADD CONSTRAINT chk_companies_status CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'inactive'::character varying])::text[])));
  END IF;
END
$sync$;

-- company_role_permissions: uq_crp_role_permission
DO $sync$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = to_regclass('public.company_role_permissions') AND conname = 'uq_crp_role_permission' AND pg_get_constraintdef(oid) = 'UNIQUE (role_id, permission_id)') THEN
ALTER TABLE public.company_role_permissions DROP CONSTRAINT IF EXISTS uq_crp_role_permission CASCADE;
ALTER TABLE public.company_role_permissions ADD CONSTRAINT uq_crp_role_permission UNIQUE (role_id, permission_id);
  END IF;
END
$sync$;

-- company_roles: uq_company_roles_name
DO $sync$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = to_regclass('public.company_roles') AND conname = 'uq_company_roles_name' AND pg_get_constraintdef(oid) = 'UNIQUE (name)') THEN
ALTER TABLE public.company_roles DROP CONSTRAINT IF EXISTS uq_company_roles_name CASCADE;
ALTER TABLE public.company_roles ADD CONSTRAINT uq_company_roles_name UNIQUE (name);
  END IF;
END
$sync$;

-- company_user: chk_company_user_status
DO $sync$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = to_regclass('public.company_user') AND conname = 'chk_company_user_status' AND pg_get_constraintdef(oid) = 'CHECK (((status)::text = ANY ((ARRAY[''ACTIVE''::character varying, ''INACTIVE''::character varying])::text[])))') THEN
ALTER TABLE public.company_user DROP CONSTRAINT IF EXISTS chk_company_user_status CASCADE;
ALTER TABLE public.company_user ADD CONSTRAINT chk_company_user_status CHECK (((status)::text = ANY ((ARRAY['ACTIVE'::character varying, 'INACTIVE'::character varying])::text[])));
  END IF;
END
$sync$;

-- company_user_permissions: uq_cup_key
DO $sync$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = to_regclass('public.company_user_permissions') AND conname = 'uq_cup_key' AND pg_get_constraintdef(oid) = 'UNIQUE (key)') THEN
ALTER TABLE public.company_user_permissions DROP CONSTRAINT IF EXISTS uq_cup_key CASCADE;
ALTER TABLE public.company_user_permissions ADD CONSTRAINT uq_cup_key UNIQUE (key);
  END IF;
END
$sync$;

-- company_user_pin: uq_company_user_pin_user
DO $sync$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = to_regclass('public.company_user_pin') AND conname = 'uq_company_user_pin_user' AND pg_get_constraintdef(oid) = 'UNIQUE (company_user_id)') THEN
ALTER TABLE public.company_user_pin DROP CONSTRAINT IF EXISTS uq_company_user_pin_user CASCADE;
ALTER TABLE public.company_user_pin ADD CONSTRAINT uq_company_user_pin_user UNIQUE (company_user_id);
  END IF;
END
$sync$;

-- company_user_roles: uq_cur_user_role
DO $sync$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = to_regclass('public.company_user_roles') AND conname = 'uq_cur_user_role' AND pg_get_constraintdef(oid) = 'UNIQUE (company_user_id, role_id)') THEN
ALTER TABLE public.company_user_roles DROP CONSTRAINT IF EXISTS uq_cur_user_role CASCADE;
ALTER TABLE public.company_user_roles ADD CONSTRAINT uq_cur_user_role UNIQUE (company_user_id, role_id);
  END IF;
END
$sync$;

-- company_role_permissions: fk_crp_permission
DO $sync$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = to_regclass('public.company_role_permissions') AND conname = 'fk_crp_permission' AND pg_get_constraintdef(oid) = 'FOREIGN KEY (permission_id) REFERENCES company_user_permissions(id) ON DELETE CASCADE') THEN
ALTER TABLE public.company_role_permissions DROP CONSTRAINT IF EXISTS fk_crp_permission CASCADE;
ALTER TABLE public.company_role_permissions ADD CONSTRAINT fk_crp_permission FOREIGN KEY (permission_id) REFERENCES company_user_permissions(id) ON DELETE CASCADE;
  END IF;
END
$sync$;

-- company_role_permissions: fk_crp_role
DO $sync$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = to_regclass('public.company_role_permissions') AND conname = 'fk_crp_role' AND pg_get_constraintdef(oid) = 'FOREIGN KEY (role_id) REFERENCES company_roles(id) ON DELETE CASCADE') THEN
ALTER TABLE public.company_role_permissions DROP CONSTRAINT IF EXISTS fk_crp_role CASCADE;
ALTER TABLE public.company_role_permissions ADD CONSTRAINT fk_crp_role FOREIGN KEY (role_id) REFERENCES company_roles(id) ON DELETE CASCADE;
  END IF;
END
$sync$;

-- company_user: fk_company_user_company
DO $sync$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = to_regclass('public.company_user') AND conname = 'fk_company_user_company' AND pg_get_constraintdef(oid) = 'FOREIGN KEY (company_id) REFERENCES companies(id)') THEN
ALTER TABLE public.company_user DROP CONSTRAINT IF EXISTS fk_company_user_company CASCADE;
ALTER TABLE public.company_user ADD CONSTRAINT fk_company_user_company FOREIGN KEY (company_id) REFERENCES companies(id);
  END IF;
END
$sync$;

-- company_user_pin: fk_company_user_pin_user
DO $sync$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = to_regclass('public.company_user_pin') AND conname = 'fk_company_user_pin_user' AND pg_get_constraintdef(oid) = 'FOREIGN KEY (company_user_id) REFERENCES company_user(id)') THEN
ALTER TABLE public.company_user_pin DROP CONSTRAINT IF EXISTS fk_company_user_pin_user CASCADE;
ALTER TABLE public.company_user_pin ADD CONSTRAINT fk_company_user_pin_user FOREIGN KEY (company_user_id) REFERENCES company_user(id);
  END IF;
END
$sync$;

-- company_user_roles: fk_cur_role
DO $sync$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = to_regclass('public.company_user_roles') AND conname = 'fk_cur_role' AND pg_get_constraintdef(oid) = 'FOREIGN KEY (role_id) REFERENCES company_roles(id) ON DELETE CASCADE') THEN
ALTER TABLE public.company_user_roles DROP CONSTRAINT IF EXISTS fk_cur_role CASCADE;
ALTER TABLE public.company_user_roles ADD CONSTRAINT fk_cur_role FOREIGN KEY (role_id) REFERENCES company_roles(id) ON DELETE CASCADE;
  END IF;
END
$sync$;

-- company_user_roles: fk_cur_user
DO $sync$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = to_regclass('public.company_user_roles') AND conname = 'fk_cur_user' AND pg_get_constraintdef(oid) = 'FOREIGN KEY (company_user_id) REFERENCES company_user(id)') THEN
ALTER TABLE public.company_user_roles DROP CONSTRAINT IF EXISTS fk_cur_user CASCADE;
ALTER TABLE public.company_user_roles ADD CONSTRAINT fk_cur_user FOREIGN KEY (company_user_id) REFERENCES company_user(id);
  END IF;
END
$sync$;

-- rider_documents: rider_documents_media_fkey
DO $sync$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = to_regclass('public.rider_documents') AND conname = 'rider_documents_media_fkey' AND pg_get_constraintdef(oid) = 'FOREIGN KEY (rider_media_id) REFERENCES rider_media(media_id) ON DELETE SET NULL') THEN
ALTER TABLE public.rider_documents DROP CONSTRAINT IF EXISTS rider_documents_media_fkey CASCADE;
ALTER TABLE public.rider_documents ADD CONSTRAINT rider_documents_media_fkey FOREIGN KEY (rider_media_id) REFERENCES rider_media(media_id) ON DELETE SET NULL;
  END IF;
END
$sync$;

-- rider_user_roles: rider_user_roles_rider_fkey
DO $sync$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = to_regclass('public.rider_user_roles') AND conname = 'rider_user_roles_rider_fkey' AND pg_get_constraintdef(oid) = 'FOREIGN KEY (rider_id) REFERENCES dl_rider(rider_id) ON DELETE CASCADE') THEN
ALTER TABLE public.rider_user_roles DROP CONSTRAINT IF EXISTS rider_user_roles_rider_fkey CASCADE;
ALTER TABLE public.rider_user_roles ADD CONSTRAINT rider_user_roles_rider_fkey FOREIGN KEY (rider_id) REFERENCES dl_rider(rider_id) ON DELETE CASCADE;
  END IF;
END
$sync$;

-- admin_users: idx_admin_users_id
DO $sync$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'idx_admin_users_id' AND indexdef = 'CREATE INDEX idx_admin_users_id ON public.admin_users USING btree (id)') THEN
CREATE INDEX idx_admin_users_id ON public.admin_users USING btree (id);
  END IF;
END
$sync$;

-- cases: idx_cases_assigned_dc_user
DO $sync$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'idx_cases_assigned_dc_user' AND indexdef = 'CREATE INDEX idx_cases_assigned_dc_user ON public.cases USING btree (assigned_dc_user)') THEN
CREATE INDEX idx_cases_assigned_dc_user ON public.cases USING btree (assigned_dc_user);
  END IF;
END
$sync$;

-- cases: idx_cases_assigned_team_user
DO $sync$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'idx_cases_assigned_team_user' AND indexdef = 'CREATE INDEX idx_cases_assigned_team_user ON public.cases USING btree (assigned_team_user)') THEN
CREATE INDEX idx_cases_assigned_team_user ON public.cases USING btree (assigned_team_user);
  END IF;
END
$sync$;

-- cases: idx_cases_created_at
DO $sync$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'idx_cases_created_at' AND indexdef = 'CREATE INDEX idx_cases_created_at ON public.cases USING btree (created_at DESC)') THEN
CREATE INDEX idx_cases_created_at ON public.cases USING btree (created_at DESC);
  END IF;
END
$sync$;

-- cases: idx_cases_dedupe_hash
DO $sync$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'idx_cases_dedupe_hash' AND indexdef = 'CREATE INDEX idx_cases_dedupe_hash ON public.cases USING btree (dedupe_hash)') THEN
CREATE INDEX idx_cases_dedupe_hash ON public.cases USING btree (dedupe_hash);
  END IF;
END
$sync$;

-- cases: idx_cases_initiated_by
DO $sync$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'idx_cases_initiated_by' AND indexdef = 'CREATE INDEX idx_cases_initiated_by ON public.cases USING btree (initiated_by_id)') THEN
CREATE INDEX idx_cases_initiated_by ON public.cases USING btree (initiated_by_id);
  END IF;
END
$sync$;

-- cases: idx_cases_primary_entity
DO $sync$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'idx_cases_primary_entity' AND indexdef = 'CREATE INDEX idx_cases_primary_entity ON public.cases USING btree (primary_entity_type, primary_entity_id)') THEN
CREATE INDEX idx_cases_primary_entity ON public.cases USING btree (primary_entity_type, primary_entity_id);
  END IF;
END
$sync$;

-- cases: idx_cases_status
DO $sync$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'idx_cases_status' AND indexdef = 'CREATE INDEX idx_cases_status ON public.cases USING btree (status)') THEN
CREATE INDEX idx_cases_status ON public.cases USING btree (status);
  END IF;
END
$sync$;

-- company_role_permissions: idx_crp_role
DO $sync$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'idx_crp_role' AND indexdef = 'CREATE INDEX idx_crp_role ON public.company_role_permissions USING btree (role_id)') THEN
CREATE INDEX idx_crp_role ON public.company_role_permissions USING btree (role_id);
  END IF;
END
$sync$;

-- company_user: idx_company_user_company
DO $sync$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'idx_company_user_company' AND indexdef = 'CREATE INDEX idx_company_user_company ON public.company_user USING btree (company_id)') THEN
CREATE INDEX idx_company_user_company ON public.company_user USING btree (company_id);
  END IF;
END
$sync$;

-- company_user: idx_company_user_status
DO $sync$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'idx_company_user_status' AND indexdef = 'CREATE INDEX idx_company_user_status ON public.company_user USING btree (status)') THEN
CREATE INDEX idx_company_user_status ON public.company_user USING btree (status);
  END IF;
END
$sync$;

-- company_user: uq_company_user_email
DO $sync$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'uq_company_user_email' AND indexdef = 'CREATE UNIQUE INDEX uq_company_user_email ON public.company_user USING btree (email) WHERE ((deleted_at IS NULL) AND (email IS NOT NULL))') THEN
CREATE UNIQUE INDEX uq_company_user_email ON public.company_user USING btree (email) WHERE ((deleted_at IS NULL) AND (email IS NOT NULL));
  END IF;
END
$sync$;

-- company_user: uq_company_user_phone
DO $sync$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'uq_company_user_phone' AND indexdef = 'CREATE UNIQUE INDEX uq_company_user_phone ON public.company_user USING btree (phone) WHERE ((deleted_at IS NULL) AND (phone IS NOT NULL))') THEN
CREATE UNIQUE INDEX uq_company_user_phone ON public.company_user USING btree (phone) WHERE ((deleted_at IS NULL) AND (phone IS NOT NULL));
  END IF;
END
$sync$;

-- company_user_roles: idx_cur_user
DO $sync$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'idx_cur_user' AND indexdef = 'CREATE INDEX idx_cur_user ON public.company_user_roles USING btree (company_user_id)') THEN
CREATE INDEX idx_cur_user ON public.company_user_roles USING btree (company_user_id);
  END IF;
END
$sync$;

-- inventory_reservation_ledger: idx_inventory_reservation_ledger_order
DO $sync$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'idx_inventory_reservation_ledger_order' AND indexdef = 'CREATE INDEX idx_inventory_reservation_ledger_order ON public.inventory_reservation_ledger USING btree (order_id)') THEN
CREATE INDEX idx_inventory_reservation_ledger_order ON public.inventory_reservation_ledger USING btree (order_id);
  END IF;
END
$sync$;

-- inventory_reservation_ledger: idx_inventory_reservation_ledger_vid_status
DO $sync$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'idx_inventory_reservation_ledger_vid_status' AND indexdef = 'CREATE INDEX idx_inventory_reservation_ledger_vid_status ON public.inventory_reservation_ledger USING btree (variant_inventory_daily_id, status)') THEN
CREATE INDEX idx_inventory_reservation_ledger_vid_status ON public.inventory_reservation_ledger USING btree (variant_inventory_daily_id, status);
  END IF;
END
$sync$;

-- kitchen_user_invitations: idx_kui_kitchen_status
DO $sync$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'idx_kui_kitchen_status' AND indexdef = 'CREATE INDEX idx_kui_kitchen_status ON public.kitchen_user_invitations USING btree (kitchen_id, status)') THEN
CREATE INDEX idx_kui_kitchen_status ON public.kitchen_user_invitations USING btree (kitchen_id, status);
  END IF;
END
$sync$;

-- kitchen_user_invitations: idx_kui_phone
DO $sync$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'idx_kui_phone' AND indexdef = 'CREATE INDEX idx_kui_phone ON public.kitchen_user_invitations USING btree (phone)') THEN
CREATE INDEX idx_kui_phone ON public.kitchen_user_invitations USING btree (phone);
  END IF;
END
$sync$;

-- kitchen_user_invitations: uq_kui_invitation_code
DO $sync$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'uq_kui_invitation_code' AND indexdef = 'CREATE UNIQUE INDEX uq_kui_invitation_code ON public.kitchen_user_invitations USING btree (invitation_code)') THEN
CREATE UNIQUE INDEX uq_kui_invitation_code ON public.kitchen_user_invitations USING btree (invitation_code);
  END IF;
END
$sync$;

-- variant_inventory_daily: idx_variant_inventory_daily_kitchen_date
DO $sync$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'idx_variant_inventory_daily_kitchen_date' AND indexdef = 'CREATE INDEX idx_variant_inventory_daily_kitchen_date ON public.variant_inventory_daily USING btree (kitchen_id, inventory_date)') THEN
CREATE INDEX idx_variant_inventory_daily_kitchen_date ON public.variant_inventory_daily USING btree (kitchen_id, inventory_date);
  END IF;
END
$sync$;

-- variant_inventory_daily_history: idx_variant_inventory_daily_history_vid_created
DO $sync$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'idx_variant_inventory_daily_history_vid_created' AND indexdef = 'CREATE INDEX idx_variant_inventory_daily_history_vid_created ON public.variant_inventory_daily_history USING btree (variant_inventory_daily_id, created_at)') THEN
CREATE INDEX idx_variant_inventory_daily_history_vid_created ON public.variant_inventory_daily_history USING btree (variant_inventory_daily_id, created_at);
  END IF;
END
$sync$;

-- kitchen_user_invitations: trg_kui_updated_at
DO $sync$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_kui_updated_at' AND tgrelid = to_regclass('public.kitchen_user_invitations')) THEN
CREATE TRIGGER trg_kui_updated_at BEFORE UPDATE ON public.kitchen_user_invitations FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;
END
$sync$;
`);
};

exports.down = () => {
  // Intentionally empty. See header.
};
