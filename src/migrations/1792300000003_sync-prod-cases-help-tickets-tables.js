/**
 * Sync with production: case_entities and help_tickets (Cases domain)
 *
 * Part of the production schema sync. Generated from a read-only schema dump of the shared
 * dev/production database (2026-10-17) and compared with a database built from master.
 * Every statement is guarded: on production (where these objects already exist) it does nothing;
 * on a fresh database it recreates what production has.
 * down() is intentionally a no-op so that migrate:down can never drop live tables or data.
 * 
 * Tables: case_entities, help_tickets
 * Foreign keys are added in the "new-table-foreign-keys" migration.
 */

exports.up = (pgm) => {
  pgm.sql(String.raw`
-- case_entities
DO $sync$
BEGIN
  IF to_regclass('public.case_entities') IS NULL THEN
CREATE TABLE public.case_entities (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    case_id uuid NOT NULL,
    entity_type character varying(30) NOT NULL,
    entity_id uuid NOT NULL,
    entity_business_reference character varying(100),
    relation_type character varying(30) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE ONLY public.case_entities
    ADD CONSTRAINT case_entities_case_id_entity_type_entity_id_relation_type_key UNIQUE (case_id, entity_type, entity_id, relation_type);
ALTER TABLE ONLY public.case_entities
    ADD CONSTRAINT case_entities_pkey PRIMARY KEY (id);
CREATE INDEX idx_case_entities_case_id ON public.case_entities USING btree (case_id);
CREATE INDEX idx_case_entities_entity ON public.case_entities USING btree (entity_type, entity_id);
CREATE INDEX idx_case_entities_reference ON public.case_entities USING btree (entity_business_reference);
  END IF;
END
$sync$;

-- help_tickets
DO $sync$
BEGIN
  IF to_regclass('public.help_tickets') IS NULL THEN
CREATE TABLE public.help_tickets (
    help_ticket_id uuid DEFAULT gen_random_uuid() NOT NULL,
    help_ticket_number character varying(30) NOT NULL,
    name character varying(255) NOT NULL,
    mobile character varying(20) NOT NULL,
    email character varying(255),
    user_type character varying(30) NOT NULL,
    issue_type character varying(30) NOT NULL,
    title character varying(255) NOT NULL,
    description text NOT NULL,
    ip_address character varying(45) NOT NULL,
    status character varying(30) DEFAULT 'INITIATED'::character varying NOT NULL,
    admin_comments jsonb DEFAULT '[]'::jsonb NOT NULL,
    is_internal boolean DEFAULT false NOT NULL,
    linked_case_id uuid,
    linked_case_reference character varying(30),
    idempotency_key character varying(100),
    dedupe_hash character(64),
    updated_by uuid,
    updated_by_name character varying(255),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone,
    deleted_at timestamp with time zone
);
ALTER TABLE ONLY public.help_tickets
    ADD CONSTRAINT help_tickets_dedupe_hash_key UNIQUE (dedupe_hash);
ALTER TABLE ONLY public.help_tickets
    ADD CONSTRAINT help_tickets_help_ticket_number_key UNIQUE (help_ticket_number);
ALTER TABLE ONLY public.help_tickets
    ADD CONSTRAINT help_tickets_idempotency_key_key UNIQUE (idempotency_key);
ALTER TABLE ONLY public.help_tickets
    ADD CONSTRAINT help_tickets_pkey PRIMARY KEY (help_ticket_id);
CREATE INDEX idx_help_tickets_created_at ON public.help_tickets USING btree (created_at DESC) WHERE (deleted_at IS NULL);
CREATE INDEX idx_help_tickets_help_ticket_id ON public.help_tickets USING btree (help_ticket_id);
CREATE INDEX idx_help_tickets_issue_type ON public.help_tickets USING btree (issue_type) WHERE (deleted_at IS NULL);
CREATE INDEX idx_help_tickets_status ON public.help_tickets USING btree (status) WHERE (deleted_at IS NULL);
CREATE INDEX idx_help_tickets_status_created_at ON public.help_tickets USING btree (status, created_at DESC) WHERE (deleted_at IS NULL);
CREATE INDEX idx_help_tickets_user_type ON public.help_tickets USING btree (user_type) WHERE (deleted_at IS NULL);
  END IF;
END
$sync$;
`);
};

exports.down = () => {
  // Intentionally empty. See header.
};
