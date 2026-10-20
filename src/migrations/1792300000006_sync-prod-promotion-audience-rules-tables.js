/**
 * Sync with production: Promotion audience rules
 *
 * Part of the production schema sync. Generated from a read-only schema dump of the shared
 * dev/production database (2026-10-17) and compared with a database built from master.
 * Every statement is guarded: on production (where these objects already exist) it does nothing;
 * on a fresh database it recreates what production has.
 * down() is intentionally a no-op so that migrate:down can never drop live tables or data.
 * 
 * Tables: audience_rules, audience_rules_staging
 * Foreign keys are added in the "new-table-foreign-keys" migration.
 */

exports.up = (pgm) => {
  pgm.sql(String.raw`
-- audience_rules
DO $sync$
BEGIN
  IF to_regclass('public.audience_rules') IS NULL THEN
CREATE TABLE public.audience_rules (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    promotion_id uuid NOT NULL,
    rule_type character varying(40) NOT NULL,
    params_json jsonb,
    ordinal integer DEFAULT 1 NOT NULL,
    status character varying(20) DEFAULT '''ACTIVE'''::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone
);
ALTER TABLE ONLY public.audience_rules
    ADD CONSTRAINT audience_rules_pkey1 PRIMARY KEY (id);
  END IF;
END
$sync$;

-- audience_rules_staging
DO $sync$
BEGIN
  IF to_regclass('public.audience_rules_staging') IS NULL THEN
CREATE TABLE public.audience_rules_staging (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    promotion_id uuid NOT NULL,
    audience_rule_id uuid,
    rule_type character varying(40) NOT NULL,
    params_json jsonb,
    ordinal integer DEFAULT 1 NOT NULL,
    status character varying(20) DEFAULT '''DRAFT'''::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone
);
ALTER TABLE ONLY public.audience_rules_staging
    ADD CONSTRAINT audience_rules_staging_pkey1 PRIMARY KEY (id);
  END IF;
END
$sync$;
`);
};

exports.down = () => {
  // Intentionally empty. See header.
};
