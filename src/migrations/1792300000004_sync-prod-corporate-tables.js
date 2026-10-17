/**
 * Sync with production: Corporate domain (company_* and request_items)
 *
 * Part of the production schema sync. Generated from a read-only schema dump of the shared
 * dev/production database (2026-10-17) and compared with a database built from master.
 * Every statement is guarded: on production (where these objects already exist) it does nothing;
 * on a fresh database it recreates what production has.
 * down() is intentionally a no-op so that migrate:down can never drop live tables or data.
 * 
 * Tables: company_addresses, company_branch_working_hours, company_branches, company_bulk_import_jobs, company_employee_consumption_analytics, company_employee_consumptions, company_employee_customer_maps, company_employee_monthly_consumption_analytics, company_employee_plan_mappings, company_employees, company_holidays, company_plan_branch_eligibilities, company_plan_consumption_analytics, company_plans, company_requests, company_user_role_mappings, request_items
 * Foreign keys are added in the "new-table-foreign-keys" migration.
 */

exports.up = (pgm) => {
  pgm.sql(String.raw`
-- company_addresses
DO $sync$
BEGIN
  IF to_regclass('public.company_addresses') IS NULL THEN
CREATE TABLE public.company_addresses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    branch_id uuid NOT NULL,
    label character varying(100),
    type character varying(20) NOT NULL,
    street text,
    city character varying(100),
    postal_code character varying(20),
    delivery_zone character varying(100),
    is_default boolean DEFAULT false NOT NULL,
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone,
    CONSTRAINT chk_addresses_type CHECK (((type)::text = ANY ((ARRAY['office'::character varying, 'delivery_hub'::character varying])::text[])))
);
ALTER TABLE ONLY public.company_addresses
    ADD CONSTRAINT company_addresses_pkey PRIMARY KEY (id);
CREATE INDEX idx_addresses_branch ON public.company_addresses USING btree (branch_id);
CREATE INDEX idx_addresses_company ON public.company_addresses USING btree (company_id);
  END IF;
END
$sync$;

-- company_branch_working_hours
DO $sync$
BEGIN
  IF to_regclass('public.company_branch_working_hours') IS NULL THEN
CREATE TABLE public.company_branch_working_hours (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    branch_id uuid NOT NULL,
    open_time time without time zone,
    close_time time without time zone,
    days_active jsonb,
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone
);
ALTER TABLE ONLY public.company_branch_working_hours
    ADD CONSTRAINT company_branch_working_hours_branch_id_key UNIQUE (branch_id);
ALTER TABLE ONLY public.company_branch_working_hours
    ADD CONSTRAINT company_branch_working_hours_pkey PRIMARY KEY (id);
CREATE INDEX idx_bwh_company ON public.company_branch_working_hours USING btree (company_id);
  END IF;
END
$sync$;

-- company_branches
DO $sync$
BEGIN
  IF to_regclass('public.company_branches') IS NULL THEN
CREATE TABLE public.company_branches (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    branch_reference_number character varying(50) NOT NULL,
    name character varying(100) NOT NULL,
    city character varying(100),
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone
);
ALTER TABLE ONLY public.company_branches
    ADD CONSTRAINT company_branches_branch_reference_number_key UNIQUE (branch_reference_number);
ALTER TABLE ONLY public.company_branches
    ADD CONSTRAINT company_branches_pkey PRIMARY KEY (id);
CREATE INDEX idx_branches_company ON public.company_branches USING btree (company_id);
  END IF;
END
$sync$;

-- company_bulk_import_jobs
DO $sync$
BEGIN
  IF to_regclass('public.company_bulk_import_jobs') IS NULL THEN
CREATE TABLE public.company_bulk_import_jobs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    created_by uuid NOT NULL,
    s3_file_key text NOT NULL,
    original_file_name character varying(255),
    total_records integer DEFAULT 0 NOT NULL,
    processed_records integer DEFAULT 0 NOT NULL,
    failed_records integer DEFAULT 0 NOT NULL,
    status character varying(30) DEFAULT 'uploaded'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone,
    CONSTRAINT chk_bij_status CHECK (((status)::text = ANY ((ARRAY['uploaded'::character varying, 'processing'::character varying, 'completed'::character varying, 'partial_failed'::character varying])::text[])))
);
ALTER TABLE ONLY public.company_bulk_import_jobs
    ADD CONSTRAINT company_bulk_import_jobs_pkey PRIMARY KEY (id);
  END IF;
END
$sync$;

-- company_employee_consumption_analytics
DO $sync$
BEGIN
  IF to_regclass('public.company_employee_consumption_analytics') IS NULL THEN
CREATE TABLE public.company_employee_consumption_analytics (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    employee_id uuid NOT NULL,
    company_id uuid NOT NULL,
    plan_id uuid NOT NULL,
    week_start date,
    week_end date,
    total_consumed numeric,
    total_order_value numeric,
    order_count integer,
    avg_per_order numeric,
    utilization_pct numeric,
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    computed_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone
);
ALTER TABLE ONLY public.company_employee_consumption_analytics
    ADD CONSTRAINT company_employee_consumption_analytics_pkey PRIMARY KEY (id);
CREATE INDEX idx_eca_employee_company ON public.company_employee_consumption_analytics USING btree (employee_id, company_id);
  END IF;
END
$sync$;

-- company_employee_consumptions
DO $sync$
BEGIN
  IF to_regclass('public.company_employee_consumptions') IS NULL THEN
CREATE TABLE public.company_employee_consumptions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    employee_id uuid NOT NULL,
    employee_plan_mapping_id uuid NOT NULL,
    order_reference_number character varying(50),
    kitchen_name character varying(100),
    order_details jsonb,
    order_date_time timestamp without time zone,
    total_order_value numeric,
    subsidy_amount numeric,
    employee_paid numeric,
    kitchen_promo numeric,
    status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone
);
ALTER TABLE ONLY public.company_employee_consumptions
    ADD CONSTRAINT company_employee_consumptions_pkey PRIMARY KEY (id);
CREATE INDEX idx_ec_employee ON public.company_employee_consumptions USING btree (employee_id);
CREATE INDEX idx_ec_mapping ON public.company_employee_consumptions USING btree (employee_plan_mapping_id);
  END IF;
END
$sync$;

-- company_employee_customer_maps
DO $sync$
BEGIN
  IF to_regclass('public.company_employee_customer_maps') IS NULL THEN
CREATE TABLE public.company_employee_customer_maps (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    employee_id uuid NOT NULL,
    customer_id uuid,
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    linked_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone
);
ALTER TABLE ONLY public.company_employee_customer_maps
    ADD CONSTRAINT company_employee_customer_maps_customer_id_key UNIQUE (customer_id);
ALTER TABLE ONLY public.company_employee_customer_maps
    ADD CONSTRAINT company_employee_customer_maps_employee_id_key UNIQUE (employee_id);
ALTER TABLE ONLY public.company_employee_customer_maps
    ADD CONSTRAINT company_employee_customer_maps_pkey PRIMARY KEY (id);
  END IF;
END
$sync$;

-- company_employee_monthly_consumption_analytics
DO $sync$
BEGIN
  IF to_regclass('public.company_employee_monthly_consumption_analytics') IS NULL THEN
CREATE TABLE public.company_employee_monthly_consumption_analytics (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    employee_id uuid NOT NULL,
    company_id uuid NOT NULL,
    plan_id uuid NOT NULL,
    month character varying(20),
    start_date date,
    end_date date,
    total_consumed numeric,
    total_order_value numeric,
    monthly_limit numeric,
    order_count integer,
    avg_per_order numeric,
    utilization_pct numeric,
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    computed_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone
);
ALTER TABLE ONLY public.company_employee_monthly_consumption_analytics
    ADD CONSTRAINT company_employee_monthly_consumption_analytics_pkey PRIMARY KEY (id);
CREATE INDEX idx_emca_employee_company ON public.company_employee_monthly_consumption_analytics USING btree (employee_id, company_id);
  END IF;
END
$sync$;

-- company_employee_plan_mappings
DO $sync$
BEGIN
  IF to_regclass('public.company_employee_plan_mappings') IS NULL THEN
CREATE TABLE public.company_employee_plan_mappings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    employee_id uuid NOT NULL,
    plan_id uuid NOT NULL,
    plan_name character varying(100),
    effective_from date,
    effective_to date,
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone
);
ALTER TABLE ONLY public.company_employee_plan_mappings
    ADD CONSTRAINT company_employee_plan_mappings_pkey PRIMARY KEY (id);
CREATE INDEX idx_epm_employee ON public.company_employee_plan_mappings USING btree (employee_id);
CREATE INDEX idx_epm_plan ON public.company_employee_plan_mappings USING btree (plan_id);
  END IF;
END
$sync$;

-- company_employees
DO $sync$
BEGIN
  IF to_regclass('public.company_employees') IS NULL THEN
CREATE TABLE public.company_employees (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    branch_id uuid,
    bulk_import_job_id uuid,
    business_reference character varying(50),
    employee_external_id character varying(50),
    name character varying(100) NOT NULL,
    email character varying(150),
    phone character varying(20),
    department character varying(100),
    "position" character varying(100),
    employment_type character varying(20),
    additional_fields jsonb,
    approval_status character varying(20) DEFAULT 'DRAFT'::character varying NOT NULL,
    operational_status character varying(20) DEFAULT 'INACTIVE'::character varying NOT NULL,
    activated_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone,
    CONSTRAINT chk_employees_approval_status CHECK (((approval_status)::text = ANY ((ARRAY['DRAFT'::character varying, 'SUBMITTED'::character varying, 'APPROVED'::character varying, 'REJECTED'::character varying])::text[]))),
    CONSTRAINT chk_employees_employment_type CHECK (((employment_type)::text = ANY ((ARRAY['full_time'::character varying, 'contract'::character varying, 'intern'::character varying])::text[]))),
    CONSTRAINT chk_employees_operational_status CHECK (((operational_status)::text = ANY ((ARRAY['ACTIVE'::character varying, 'INACTIVE'::character varying])::text[])))
);
ALTER TABLE ONLY public.company_employees
    ADD CONSTRAINT company_employees_business_reference_key UNIQUE (business_reference);
ALTER TABLE ONLY public.company_employees
    ADD CONSTRAINT company_employees_pkey PRIMARY KEY (id);
CREATE INDEX idx_employees_bulk_import ON public.company_employees USING btree (bulk_import_job_id) WHERE (bulk_import_job_id IS NOT NULL);
CREATE INDEX idx_employees_company ON public.company_employees USING btree (company_id);
CREATE INDEX idx_employees_company_approval ON public.company_employees USING btree (company_id, approval_status);
CREATE INDEX idx_employees_company_branch ON public.company_employees USING btree (company_id, branch_id);
CREATE UNIQUE INDEX uq_employees_company_email ON public.company_employees USING btree (company_id, email) WHERE ((deleted_at IS NULL) AND (email IS NOT NULL));
CREATE UNIQUE INDEX uq_employees_company_phone ON public.company_employees USING btree (company_id, phone) WHERE ((deleted_at IS NULL) AND (phone IS NOT NULL));
  END IF;
END
$sync$;

-- company_holidays
DO $sync$
BEGIN
  IF to_regclass('public.company_holidays') IS NULL THEN
CREATE TABLE public.company_holidays (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    branch_id uuid,
    holiday_name character varying(100) NOT NULL,
    dates jsonb NOT NULL,
    type character varying(20) NOT NULL,
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone,
    CONSTRAINT chk_holidays_status CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'passed'::character varying, 'inactive'::character varying])::text[]))),
    CONSTRAINT chk_holidays_type CHECK (((type)::text = ANY ((ARRAY['public'::character varying, 'company'::character varying])::text[])))
);
ALTER TABLE ONLY public.company_holidays
    ADD CONSTRAINT company_holidays_pkey PRIMARY KEY (id);
CREATE INDEX idx_holidays_company ON public.company_holidays USING btree (company_id);
CREATE INDEX idx_holidays_company_branch ON public.company_holidays USING btree (company_id, branch_id);
  END IF;
END
$sync$;

-- company_plan_branch_eligibilities
DO $sync$
BEGIN
  IF to_regclass('public.company_plan_branch_eligibilities') IS NULL THEN
CREATE TABLE public.company_plan_branch_eligibilities (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    plan_id uuid NOT NULL,
    branch_id uuid NOT NULL,
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone
);
ALTER TABLE ONLY public.company_plan_branch_eligibilities
    ADD CONSTRAINT company_plan_branch_eligibilities_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.company_plan_branch_eligibilities
    ADD CONSTRAINT uq_pbe_plan_branch UNIQUE (plan_id, branch_id);
CREATE INDEX idx_pbe_branch ON public.company_plan_branch_eligibilities USING btree (branch_id);
CREATE INDEX idx_pbe_plan ON public.company_plan_branch_eligibilities USING btree (plan_id);
  END IF;
END
$sync$;

-- company_plan_consumption_analytics
DO $sync$
BEGIN
  IF to_regclass('public.company_plan_consumption_analytics') IS NULL THEN
CREATE TABLE public.company_plan_consumption_analytics (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    plan_id uuid NOT NULL,
    month character varying(20),
    start_date date,
    end_date date,
    total_subsidy_used numeric,
    total_order_value numeric,
    employee_count integer,
    order_count integer,
    avg_subsidy_per_employee numeric,
    avg_order_value numeric,
    utilization_pct numeric,
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    computed_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone
);
ALTER TABLE ONLY public.company_plan_consumption_analytics
    ADD CONSTRAINT company_plan_consumption_analytics_pkey PRIMARY KEY (id);
CREATE INDEX idx_cpca_company_plan ON public.company_plan_consumption_analytics USING btree (company_id, plan_id);
  END IF;
END
$sync$;

-- company_plans
DO $sync$
BEGIN
  IF to_regclass('public.company_plans') IS NULL THEN
CREATE TABLE public.company_plans (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    parent_plan_id uuid,
    version integer DEFAULT 1 NOT NULL,
    plan_name character varying(100) NOT NULL,
    description text,
    plan_type character varying(20) NOT NULL,
    contribution_type character varying(20) NOT NULL,
    subsidy_value numeric NOT NULL,
    max_subsidy_cap numeric,
    max_usage_per_day integer,
    meal_slots jsonb,
    days_allowed jsonb,
    approval_status character varying(20) DEFAULT 'DRAFT'::character varying NOT NULL,
    operational_status character varying(20) DEFAULT 'INACTIVE'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone,
    CONSTRAINT chk_plans_approval_status CHECK (((approval_status)::text = ANY ((ARRAY['DRAFT'::character varying, 'SUBMITTED'::character varying, 'APPROVED'::character varying, 'REJECTED'::character varying])::text[]))),
    CONSTRAINT chk_plans_contribution_type CHECK (((contribution_type)::text = ANY ((ARRAY['fixed'::character varying, 'percentage'::character varying])::text[]))),
    CONSTRAINT chk_plans_operational_status CHECK (((operational_status)::text = ANY ((ARRAY['ACTIVE'::character varying, 'INACTIVE'::character varying, 'SUPERSEDED'::character varying])::text[]))),
    CONSTRAINT chk_plans_plan_type CHECK (((plan_type)::text = ANY ((ARRAY['daily'::character varying, 'monthly'::character varying])::text[])))
);
ALTER TABLE ONLY public.company_plans
    ADD CONSTRAINT company_plans_pkey PRIMARY KEY (id);
CREATE INDEX idx_plans_company ON public.company_plans USING btree (company_id);
CREATE INDEX idx_plans_company_approval ON public.company_plans USING btree (company_id, approval_status);
CREATE INDEX idx_plans_parent ON public.company_plans USING btree (parent_plan_id) WHERE (parent_plan_id IS NOT NULL);
  END IF;
END
$sync$;

-- company_requests
DO $sync$
BEGIN
  IF to_regclass('public.company_requests') IS NULL THEN
CREATE TABLE public.company_requests (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    requested_by uuid NOT NULL,
    requested_by_role character varying(50),
    entity_name character varying(50),
    entity_id uuid,
    sub_entity_name character varying(50),
    sub_entity_id uuid,
    action character varying(100),
    workflow_id character varying(100),
    request_name character varying(100),
    business_reference character varying(100),
    request_type character varying(20),
    reason text,
    status character varying(30) DEFAULT 'PENDING'::character varying NOT NULL,
    reviewed_by uuid,
    reviewed_at timestamp without time zone,
    is_internal boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone,
    CONSTRAINT chk_cr_request_type CHECK (((request_type)::text = ANY ((ARRAY['SINGLE'::character varying, 'BULK'::character varying])::text[]))),
    CONSTRAINT chk_cr_status CHECK (((status)::text = ANY ((ARRAY['PENDING'::character varying, 'APPROVED'::character varying, 'REJECTED'::character varying, 'PARTIALLY_APPROVED'::character varying])::text[])))
);
ALTER TABLE ONLY public.company_requests
    ADD CONSTRAINT company_requests_pkey PRIMARY KEY (id);
CREATE INDEX idx_cr_company ON public.company_requests USING btree (company_id);
CREATE INDEX idx_cr_company_status ON public.company_requests USING btree (company_id, status);
  END IF;
END
$sync$;

-- company_user_role_mappings
DO $sync$
BEGIN
  IF to_regclass('public.company_user_role_mappings') IS NULL THEN
CREATE TABLE public.company_user_role_mappings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_user_id uuid NOT NULL,
    role_id uuid NOT NULL,
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    assigned_at timestamp without time zone DEFAULT now() NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone
);
ALTER TABLE ONLY public.company_user_role_mappings
    ADD CONSTRAINT company_user_role_mappings_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.company_user_role_mappings
    ADD CONSTRAINT uq_curm_user_role UNIQUE (company_user_id, role_id);
CREATE INDEX idx_curm_user ON public.company_user_role_mappings USING btree (company_user_id);
  END IF;
END
$sync$;

-- request_items
DO $sync$
BEGIN
  IF to_regclass('public.request_items') IS NULL THEN
CREATE TABLE public.request_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    request_id uuid NOT NULL,
    request_domain character varying(20) NOT NULL,
    entity_name character varying(50),
    entity_id uuid,
    payload jsonb,
    status character varying(30) DEFAULT 'PENDING'::character varying NOT NULL,
    error_detail text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone,
    CONSTRAINT chk_ri_domain CHECK (((request_domain)::text = ANY ((ARRAY['CORPORATE'::character varying, 'CHANGE_REQUEST'::character varying])::text[])))
);
ALTER TABLE ONLY public.request_items
    ADD CONSTRAINT request_items_pkey PRIMARY KEY (id);
CREATE INDEX idx_ri_domain_request ON public.request_items USING btree (request_domain, request_id);
  END IF;
END
$sync$;
`);
};

exports.down = () => {
  // Intentionally empty. See header.
};
