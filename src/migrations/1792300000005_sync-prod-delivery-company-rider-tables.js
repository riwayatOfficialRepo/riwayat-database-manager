/**
 * Sync with production: Delivery company and rider domain (dl_*)
 *
 * Part of the production schema sync. Generated from a read-only schema dump of the shared
 * dev/production database (2026-10-17) and compared with a database built from master.
 * Every statement is guarded: on production (where these objects already exist) it does nothing;
 * on a fresh database it recreates what production has.
 * down() is intentionally a no-op so that migrate:down can never drop live tables or data.
 * 
 * Tables: dl_cod_receipt, dl_company, dl_company_document, dl_company_finance_transaction, dl_company_role_permissions, dl_company_roles, dl_company_user, dl_company_user_permissions, dl_company_user_role_mappings, dl_delivery, dl_delivery_offer, dl_delivery_payout, dl_domain_event, dl_media, dl_ride, dl_ride_offer, dl_ride_payout, dl_rider, dl_rider_auth, dl_rider_cod_wallet, dl_rider_document, dl_rider_media, dl_rider_presence, dl_rider_security_deposit, dl_rider_vehicle
 * Foreign keys are added in the "new-table-foreign-keys" migration.
 */

exports.up = (pgm) => {
  pgm.sql(String.raw`
-- dl_cod_receipt
DO $sync$
BEGIN
  IF to_regclass('public.dl_cod_receipt') IS NULL THEN
CREATE TABLE public.dl_cod_receipt (
    receipt_id uuid DEFAULT gen_random_uuid() NOT NULL,
    business_reference character varying(50) NOT NULL,
    delivery_company_id uuid NOT NULL,
    rider_id uuid NOT NULL,
    amount numeric NOT NULL,
    collection_date date NOT NULL,
    collection_method jsonb,
    status character varying(50) DEFAULT 'pending_verification'::character varying NOT NULL,
    initiated_by_details jsonb,
    comments text,
    verified_detail jsonb,
    rejected_detail jsonb,
    metadata jsonb,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);
ALTER TABLE ONLY public.dl_cod_receipt
    ADD CONSTRAINT dl_cod_receipt_business_reference_key UNIQUE (business_reference);
ALTER TABLE ONLY public.dl_cod_receipt
    ADD CONSTRAINT dl_cod_receipt_pkey PRIMARY KEY (receipt_id);
CREATE INDEX idx_dl_cod_receipt_company ON public.dl_cod_receipt USING btree (delivery_company_id);
CREATE INDEX idx_dl_cod_receipt_rider ON public.dl_cod_receipt USING btree (rider_id);
CREATE INDEX idx_dl_cod_receipt_status ON public.dl_cod_receipt USING btree (status);
  END IF;
END
$sync$;

-- dl_company
DO $sync$
BEGIN
  IF to_regclass('public.dl_company') IS NULL THEN
CREATE TABLE public.dl_company (
    delivery_company_id uuid DEFAULT gen_random_uuid() NOT NULL,
    business_reference character varying(50) NOT NULL,
    name character varying(255) NOT NULL,
    display_name character varying(255),
    legal_entity_details jsonb,
    registration_number character varying(100),
    status character varying(50) DEFAULT 'draft'::character varying NOT NULL,
    address character varying(500),
    primary_contact_name character varying(255),
    primary_contact_phone character varying(50),
    primary_contact_email character varying(150),
    operations_email character varying(150),
    operations_phone character varying(50),
    operating_hours jsonb,
    service_areas jsonb,
    sla_config jsonb,
    settlement_config jsonb,
    contract_start_date date,
    contract_end_date date,
    bank_account_details jsonb,
    notes text,
    metadata jsonb,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    created_by character varying(100)
);
ALTER TABLE ONLY public.dl_company
    ADD CONSTRAINT dl_company_business_reference_key UNIQUE (business_reference);
ALTER TABLE ONLY public.dl_company
    ADD CONSTRAINT dl_company_pkey PRIMARY KEY (delivery_company_id);
CREATE INDEX idx_dl_company_status ON public.dl_company USING btree (status);
  END IF;
END
$sync$;

-- dl_company_document
DO $sync$
BEGIN
  IF to_regclass('public.dl_company_document') IS NULL THEN
CREATE TABLE public.dl_company_document (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    doc_type character varying(100) NOT NULL,
    doc_number character varying(255) NOT NULL,
    doc_expiry_date date,
    document_details jsonb,
    status character varying(50) DEFAULT 'pending'::character varying NOT NULL,
    verified_at timestamp without time zone,
    verified_by uuid,
    uploaded_by uuid,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone,
    deleted_at timestamp without time zone
);
ALTER TABLE ONLY public.dl_company_document
    ADD CONSTRAINT dl_company_document_pkey PRIMARY KEY (id);
CREATE INDEX idx_dl_company_document_company_id ON public.dl_company_document USING btree (company_id);
CREATE INDEX idx_dl_company_document_status ON public.dl_company_document USING btree (status);
  END IF;
END
$sync$;

-- dl_company_finance_transaction
DO $sync$
BEGIN
  IF to_regclass('public.dl_company_finance_transaction') IS NULL THEN
CREATE TABLE public.dl_company_finance_transaction (
    transaction_id uuid DEFAULT gen_random_uuid() NOT NULL,
    business_reference character varying(50) NOT NULL,
    delivery_company_id uuid NOT NULL,
    type character varying(50) NOT NULL,
    amount numeric NOT NULL,
    currency character varying(10) DEFAULT 'PKR'::character varying NOT NULL,
    status character varying(50) DEFAULT 'pending_verification'::character varying NOT NULL,
    description text,
    transaction_date date NOT NULL,
    verified_by jsonb,
    requested_by jsonb,
    change_request jsonb,
    notes text,
    metadata jsonb,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);
ALTER TABLE ONLY public.dl_company_finance_transaction
    ADD CONSTRAINT dl_company_finance_transaction_business_reference_key UNIQUE (business_reference);
ALTER TABLE ONLY public.dl_company_finance_transaction
    ADD CONSTRAINT dl_company_finance_transaction_pkey PRIMARY KEY (transaction_id);
CREATE INDEX idx_dl_company_finance_company_id ON public.dl_company_finance_transaction USING btree (delivery_company_id);
CREATE INDEX idx_dl_company_finance_status ON public.dl_company_finance_transaction USING btree (status);
CREATE INDEX idx_dl_company_finance_type ON public.dl_company_finance_transaction USING btree (type);
  END IF;
END
$sync$;

-- dl_company_role_permissions
DO $sync$
BEGIN
  IF to_regclass('public.dl_company_role_permissions') IS NULL THEN
CREATE SEQUENCE IF NOT EXISTS public.dl_company_role_permissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
CREATE TABLE public.dl_company_role_permissions (
    id integer NOT NULL,
    role_id integer NOT NULL,
    permission_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);
ALTER SEQUENCE public.dl_company_role_permissions_id_seq OWNED BY public.dl_company_role_permissions.id;
ALTER TABLE ONLY public.dl_company_role_permissions ALTER COLUMN id SET DEFAULT nextval('public.dl_company_role_permissions_id_seq'::regclass);
ALTER TABLE ONLY public.dl_company_role_permissions
    ADD CONSTRAINT dl_company_role_permissions_pkey PRIMARY KEY (id);
  END IF;
END
$sync$;

-- dl_company_roles
DO $sync$
BEGIN
  IF to_regclass('public.dl_company_roles') IS NULL THEN
CREATE SEQUENCE IF NOT EXISTS public.dl_company_roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
CREATE TABLE public.dl_company_roles (
    id integer NOT NULL,
    name text NOT NULL,
    label_key text,
    description text,
    status character varying(20) DEFAULT 'ACTIVE'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone
);
ALTER SEQUENCE public.dl_company_roles_id_seq OWNED BY public.dl_company_roles.id;
ALTER TABLE ONLY public.dl_company_roles ALTER COLUMN id SET DEFAULT nextval('public.dl_company_roles_id_seq'::regclass);
ALTER TABLE ONLY public.dl_company_roles
    ADD CONSTRAINT dl_company_roles_name_key UNIQUE (name);
ALTER TABLE ONLY public.dl_company_roles
    ADD CONSTRAINT dl_company_roles_pkey PRIMARY KEY (id);
  END IF;
END
$sync$;

-- dl_company_user
DO $sync$
BEGIN
  IF to_regclass('public.dl_company_user') IS NULL THEN
CREATE TABLE public.dl_company_user (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    name character varying(100) NOT NULL,
    email character varying(150) NOT NULL,
    phone character varying(20),
    password_hash character varying(255),
    is_active boolean DEFAULT false NOT NULL,
    last_login timestamp without time zone,
    user_entity_type character varying(50) DEFAULT 'DELIVERY_COMPANY'::character varying NOT NULL,
    status character varying(20) DEFAULT 'invited'::character varying NOT NULL,
    business_reference character varying(50),
    company_code character varying(50) NOT NULL,
    failed_pin_attempts integer DEFAULT 0 NOT NULL,
    pin_blocked_until timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone
);
ALTER TABLE ONLY public.dl_company_user
    ADD CONSTRAINT dl_company_user_business_reference_key UNIQUE (business_reference);
ALTER TABLE ONLY public.dl_company_user
    ADD CONSTRAINT dl_company_user_email_key UNIQUE (email);
ALTER TABLE ONLY public.dl_company_user
    ADD CONSTRAINT dl_company_user_pkey PRIMARY KEY (id);
CREATE INDEX idx_dl_company_user_company_id ON public.dl_company_user USING btree (company_id);
CREATE INDEX idx_dl_company_user_email ON public.dl_company_user USING btree (email);
CREATE INDEX idx_dl_company_user_status ON public.dl_company_user USING btree (status);
  END IF;
END
$sync$;

-- dl_company_user_permissions
DO $sync$
BEGIN
  IF to_regclass('public.dl_company_user_permissions') IS NULL THEN
CREATE SEQUENCE IF NOT EXISTS public.dl_company_user_permissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
CREATE TABLE public.dl_company_user_permissions (
    id integer NOT NULL,
    key text NOT NULL,
    label_key text,
    description text,
    status character varying(20) DEFAULT 'ACTIVE'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);
ALTER SEQUENCE public.dl_company_user_permissions_id_seq OWNED BY public.dl_company_user_permissions.id;
ALTER TABLE ONLY public.dl_company_user_permissions ALTER COLUMN id SET DEFAULT nextval('public.dl_company_user_permissions_id_seq'::regclass);
ALTER TABLE ONLY public.dl_company_user_permissions
    ADD CONSTRAINT dl_company_user_permissions_key_key UNIQUE (key);
ALTER TABLE ONLY public.dl_company_user_permissions
    ADD CONSTRAINT dl_company_user_permissions_pkey PRIMARY KEY (id);
  END IF;
END
$sync$;

-- dl_company_user_role_mappings
DO $sync$
BEGIN
  IF to_regclass('public.dl_company_user_role_mappings') IS NULL THEN
CREATE TABLE public.dl_company_user_role_mappings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_user_id uuid NOT NULL,
    role_id integer NOT NULL,
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    assigned_at timestamp without time zone DEFAULT now() NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone
);
ALTER TABLE ONLY public.dl_company_user_role_mappings
    ADD CONSTRAINT dl_company_user_role_mappings_pkey PRIMARY KEY (id);
CREATE INDEX idx_dl_company_user_role_mappings_user ON public.dl_company_user_role_mappings USING btree (company_user_id);
  END IF;
END
$sync$;

-- dl_delivery
DO $sync$
BEGIN
  IF to_regclass('public.dl_delivery') IS NULL THEN
CREATE TABLE public.dl_delivery (
    delivery_id uuid DEFAULT gen_random_uuid() NOT NULL,
    business_reference character varying(50) NOT NULL,
    delivery_company_id uuid NOT NULL,
    rider_id uuid,
    ride_id uuid,
    stop_sequence integer,
    fulfillment_id uuid,
    order_id uuid,
    kitchen_id uuid,
    customer_id uuid,
    status character varying(20) DEFAULT 'created'::character varying NOT NULL,
    fulfillment_mode character varying(20) DEFAULT 'standard'::character varying NOT NULL,
    order_details jsonb,
    fulfillment_details jsonb,
    kitchen_details jsonb,
    customer_details jsonb,
    rider_details jsonb,
    cod_amount numeric,
    cod_collection_details jsonb,
    total_payout_amount numeric,
    assigned_at timestamp without time zone,
    assigned_details jsonb,
    picked_up_at timestamp without time zone,
    pickup_details jsonb,
    delivered_at timestamp without time zone,
    delivery_details jsonb,
    failed_at timestamp without time zone,
    failure_details jsonb,
    cancelled_at timestamp without time zone,
    cancellation_details jsonb,
    metadata jsonb,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone,
    ride_details jsonb,
    company_details jsonb,
    offer_accepted_at timestamp without time zone,
    offer_accepted_details jsonb,
    pickup_address jsonb,
    is_pickup_location_overridden boolean DEFAULT false NOT NULL,
    pickup_override_details jsonb
);
ALTER TABLE ONLY public.dl_delivery
    ADD CONSTRAINT dl_delivery_business_reference_key UNIQUE (business_reference);
ALTER TABLE ONLY public.dl_delivery
    ADD CONSTRAINT dl_delivery_pkey PRIMARY KEY (delivery_id);
CREATE INDEX idx_dl_delivery_company_status ON public.dl_delivery USING btree (delivery_company_id, status);
CREATE INDEX idx_dl_delivery_created ON public.dl_delivery USING btree (created_at DESC);
CREATE INDEX idx_dl_delivery_customer ON public.dl_delivery USING btree (customer_id);
CREATE INDEX idx_dl_delivery_fulfillment ON public.dl_delivery USING btree (fulfillment_id);
CREATE INDEX idx_dl_delivery_kitchen ON public.dl_delivery USING btree (kitchen_id);
CREATE INDEX idx_dl_delivery_ride ON public.dl_delivery USING btree (ride_id);
  END IF;
END
$sync$;

-- dl_delivery_offer
DO $sync$
BEGIN
  IF to_regclass('public.dl_delivery_offer') IS NULL THEN
CREATE TABLE public.dl_delivery_offer (
    delivery_offer_id uuid DEFAULT gen_random_uuid() NOT NULL,
    business_reference character varying(50) NOT NULL,
    delivery_id uuid NOT NULL,
    ride_id uuid NOT NULL,
    ride_offer_id uuid,
    rider_id uuid,
    status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    offer_context character varying(20) NOT NULL,
    attempt_number integer DEFAULT 1 NOT NULL,
    offered_reason character varying(50),
    offered_at timestamp without time zone NOT NULL,
    offered_details jsonb,
    expires_at timestamp without time zone NOT NULL,
    responded_at timestamp without time zone,
    response_details jsonb,
    rejection_details jsonb,
    metadata jsonb,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    delivery_details jsonb,
    ride_details jsonb,
    ride_offer_details jsonb,
    rider_details jsonb,
    is_cod_collection boolean DEFAULT false NOT NULL
);
ALTER TABLE ONLY public.dl_delivery_offer
    ADD CONSTRAINT dl_delivery_offer_business_reference_key UNIQUE (business_reference);
ALTER TABLE ONLY public.dl_delivery_offer
    ADD CONSTRAINT dl_delivery_offer_delivery_id_rider_id_attempt_number_key UNIQUE (delivery_id, rider_id, attempt_number);
ALTER TABLE ONLY public.dl_delivery_offer
    ADD CONSTRAINT dl_delivery_offer_pkey PRIMARY KEY (delivery_offer_id);
CREATE INDEX idx_dl_delivery_offer_delivery_status ON public.dl_delivery_offer USING btree (delivery_id, status);
CREATE INDEX idx_dl_delivery_offer_ride_offer ON public.dl_delivery_offer USING btree (ride_offer_id);
  END IF;
END
$sync$;

-- dl_delivery_payout
DO $sync$
BEGIN
  IF to_regclass('public.dl_delivery_payout') IS NULL THEN
CREATE TABLE public.dl_delivery_payout (
    delivery_payout_id uuid DEFAULT gen_random_uuid() NOT NULL,
    business_reference character varying(50) NOT NULL,
    delivery_id uuid NOT NULL,
    ride_id uuid NOT NULL,
    rider_id uuid NOT NULL,
    delivery_company_id uuid NOT NULL,
    payout_type character varying(20) NOT NULL,
    amount numeric NOT NULL,
    status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    description character varying(255) NOT NULL,
    payout_details jsonb,
    metadata jsonb,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    delivery_details jsonb,
    ride_details jsonb,
    rider_details jsonb,
    company_details jsonb,
    settled_at timestamp without time zone,
    settled_details jsonb
);
ALTER TABLE ONLY public.dl_delivery_payout
    ADD CONSTRAINT dl_delivery_payout_business_reference_key UNIQUE (business_reference);
ALTER TABLE ONLY public.dl_delivery_payout
    ADD CONSTRAINT dl_delivery_payout_pkey PRIMARY KEY (delivery_payout_id);
CREATE INDEX idx_dl_delivery_payout_delivery ON public.dl_delivery_payout USING btree (delivery_id);
CREATE INDEX idx_dl_delivery_payout_rider_status ON public.dl_delivery_payout USING btree (rider_id, status);
  END IF;
END
$sync$;

-- dl_domain_event
DO $sync$
BEGIN
  IF to_regclass('public.dl_domain_event') IS NULL THEN
CREATE TABLE public.dl_domain_event (
    event_id uuid DEFAULT gen_random_uuid() NOT NULL,
    event_ref character varying(50) NOT NULL,
    entity_type text NOT NULL,
    entity_id uuid NOT NULL,
    event_name text NOT NULL,
    event_version character varying(10) DEFAULT 'v1'::character varying NOT NULL,
    actor_type character varying(50) NOT NULL,
    actor_id uuid,
    occurred_at timestamp without time zone NOT NULL,
    correlation_id uuid NOT NULL,
    causation_id character varying(50),
    idempotency_key text NOT NULL,
    payload jsonb NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);
ALTER TABLE ONLY public.dl_domain_event
    ADD CONSTRAINT dl_domain_event_event_ref_key UNIQUE (event_ref);
ALTER TABLE ONLY public.dl_domain_event
    ADD CONSTRAINT dl_domain_event_idempotency_key_key UNIQUE (idempotency_key);
ALTER TABLE ONLY public.dl_domain_event
    ADD CONSTRAINT dl_domain_event_pkey PRIMARY KEY (event_id);
CREATE INDEX idx_dl_domain_event_correlation ON public.dl_domain_event USING btree (correlation_id, occurred_at);
CREATE INDEX idx_dl_domain_event_entity ON public.dl_domain_event USING btree (entity_type, entity_id, occurred_at);
  END IF;
END
$sync$;

-- dl_media
DO $sync$
BEGIN
  IF to_regclass('public.dl_media') IS NULL THEN
CREATE TABLE public.dl_media (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    rider_id uuid NOT NULL,
    entity_id uuid,
    entity_type text,
    media_type character varying(20) NOT NULL,
    media_name character varying(255),
    s3_key_original text,
    s3_key_processed text,
    s3_key_thumbnail text,
    status character varying(20) DEFAULT 'under_processing'::character varying NOT NULL,
    category_type text,
    caption text,
    is_published boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone
);
ALTER TABLE ONLY public.dl_media
    ADD CONSTRAINT dl_media_pkey PRIMARY KEY (id);
CREATE INDEX idx_dl_media_entity ON public.dl_media USING btree (entity_type, entity_id);
CREATE INDEX idx_dl_media_rider_id ON public.dl_media USING btree (rider_id);
CREATE INDEX idx_dl_media_status ON public.dl_media USING btree (status);
  END IF;
END
$sync$;

-- dl_ride
DO $sync$
BEGIN
  IF to_regclass('public.dl_ride') IS NULL THEN
CREATE TABLE public.dl_ride (
    ride_id uuid DEFAULT gen_random_uuid() NOT NULL,
    business_reference character varying(50) NOT NULL,
    delivery_company_id uuid NOT NULL,
    rider_id uuid,
    pickup_kitchen_id uuid NOT NULL,
    status character varying(20) DEFAULT 'open'::character varying NOT NULL,
    assignment_type character varying(20) DEFAULT 'auto_assigned'::character varying NOT NULL,
    total_payout_amount numeric,
    total_cod_amount numeric,
    initial_sequence jsonb,
    rider_details jsonb,
    sla_details jsonb,
    route_details jsonb,
    accepted_at timestamp without time zone,
    accepted_details jsonb,
    started_at timestamp without time zone,
    started_details jsonb,
    completed_at timestamp without time zone,
    completed_details jsonb,
    cancelled_at timestamp without time zone,
    cancellation_details jsonb,
    manual_assignment_details jsonb,
    metadata jsonb,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone,
    delivery_count integer DEFAULT 0 NOT NULL,
    offered_at timestamp without time zone,
    current_status character varying(30) DEFAULT 'offered'::character varying NOT NULL,
    is_pickup_location_overridden boolean DEFAULT false NOT NULL,
    pickup_override_details jsonb,
    reassignment_count integer DEFAULT 0 NOT NULL,
    reassignment_details jsonb
);
ALTER TABLE ONLY public.dl_ride
    ADD CONSTRAINT dl_ride_business_reference_key UNIQUE (business_reference);
ALTER TABLE ONLY public.dl_ride
    ADD CONSTRAINT dl_ride_pkey PRIMARY KEY (ride_id);
CREATE INDEX idx_dl_ride_company_status ON public.dl_ride USING btree (delivery_company_id, status);
CREATE INDEX idx_dl_ride_created ON public.dl_ride USING btree (created_at DESC);
CREATE INDEX idx_dl_ride_kitchen_status ON public.dl_ride USING btree (pickup_kitchen_id, status);
CREATE INDEX idx_dl_ride_rider_status ON public.dl_ride USING btree (rider_id, status);
  END IF;
END
$sync$;

-- dl_ride_offer
DO $sync$
BEGIN
  IF to_regclass('public.dl_ride_offer') IS NULL THEN
CREATE TABLE public.dl_ride_offer (
    ride_offer_id uuid DEFAULT gen_random_uuid() NOT NULL,
    business_reference character varying(50) NOT NULL,
    ride_id uuid NOT NULL,
    rider_id uuid NOT NULL,
    status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    attempt_number integer DEFAULT 1 NOT NULL,
    offered_reason character varying(50),
    offered_at timestamp without time zone NOT NULL,
    offered_details jsonb,
    expires_at timestamp without time zone NOT NULL,
    responded_at timestamp without time zone,
    response_details jsonb,
    rejection_details jsonb,
    metadata jsonb,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);
ALTER TABLE ONLY public.dl_ride_offer
    ADD CONSTRAINT dl_ride_offer_business_reference_key UNIQUE (business_reference);
ALTER TABLE ONLY public.dl_ride_offer
    ADD CONSTRAINT dl_ride_offer_pkey PRIMARY KEY (ride_offer_id);
ALTER TABLE ONLY public.dl_ride_offer
    ADD CONSTRAINT dl_ride_offer_ride_id_rider_id_attempt_number_key UNIQUE (ride_id, rider_id, attempt_number);
CREATE INDEX idx_dl_ride_offer_ride_status ON public.dl_ride_offer USING btree (ride_id, status);
CREATE INDEX idx_dl_ride_offer_rider_status ON public.dl_ride_offer USING btree (rider_id, status);
  END IF;
END
$sync$;

-- dl_ride_payout
DO $sync$
BEGIN
  IF to_regclass('public.dl_ride_payout') IS NULL THEN
CREATE TABLE public.dl_ride_payout (
    ride_payout_id uuid DEFAULT gen_random_uuid() NOT NULL,
    business_reference character varying(50) NOT NULL,
    ride_id uuid NOT NULL,
    rider_id uuid NOT NULL,
    delivery_company_id uuid NOT NULL,
    payout_type character varying(20) NOT NULL,
    amount numeric NOT NULL,
    status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    description character varying(255) NOT NULL,
    payout_details jsonb,
    metadata jsonb,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    ride_details jsonb,
    rider_details jsonb,
    company_details jsonb,
    settled_at timestamp without time zone,
    settled_details jsonb
);
ALTER TABLE ONLY public.dl_ride_payout
    ADD CONSTRAINT dl_ride_payout_business_reference_key UNIQUE (business_reference);
ALTER TABLE ONLY public.dl_ride_payout
    ADD CONSTRAINT dl_ride_payout_pkey PRIMARY KEY (ride_payout_id);
CREATE INDEX idx_dl_ride_payout_ride ON public.dl_ride_payout USING btree (ride_id);
CREATE INDEX idx_dl_ride_payout_rider_status ON public.dl_ride_payout USING btree (rider_id, status);
  END IF;
END
$sync$;

-- dl_rider
DO $sync$
BEGIN
  IF to_regclass('public.dl_rider') IS NULL THEN
CREATE TABLE public.dl_rider (
    rider_id uuid DEFAULT gen_random_uuid() NOT NULL,
    rider_ref character varying(50) NOT NULL,
    delivery_company_id uuid,
    full_name character varying(255),
    primary_mobile character varying(50) NOT NULL,
    is_primary_mobile_verified boolean DEFAULT false NOT NULL,
    secondary_mobile character varying(50),
    is_secondary_mobile_verified boolean DEFAULT false NOT NULL,
    email character varying(150),
    is_primary_email_verified boolean DEFAULT false NOT NULL,
    status character varying(50) DEFAULT 'pending'::character varying NOT NULL,
    profile_photo_url character varying(500),
    joined_at timestamp without time zone,
    city character varying(100),
    blocked_details jsonb,
    approved_details jsonb,
    delivery_company_ref_code character varying(100),
    notes text,
    metadata jsonb,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    created_by character varying(100),
    deleted_at timestamp without time zone
);
ALTER TABLE ONLY public.dl_rider
    ADD CONSTRAINT dl_rider_pkey PRIMARY KEY (rider_id);
ALTER TABLE ONLY public.dl_rider
    ADD CONSTRAINT dl_rider_rider_ref_key UNIQUE (rider_ref);
CREATE INDEX idx_dl_rider_delivery_company_id ON public.dl_rider USING btree (delivery_company_id);
CREATE INDEX idx_dl_rider_primary_mobile ON public.dl_rider USING btree (primary_mobile);
CREATE INDEX idx_dl_rider_status ON public.dl_rider USING btree (status);
  END IF;
END
$sync$;

-- dl_rider_auth
DO $sync$
BEGIN
  IF to_regclass('public.dl_rider_auth') IS NULL THEN
CREATE TABLE public.dl_rider_auth (
    rider_auth_id uuid DEFAULT gen_random_uuid() NOT NULL,
    rider_id uuid NOT NULL,
    pin_hash character varying(255),
    pin_set_at timestamp without time zone,
    failed_pin_attempts integer DEFAULT 0 NOT NULL,
    pin_blocked_until timestamp without time zone,
    last_login_at timestamp without time zone,
    last_login_ip character varying(45),
    last_device_id character varying(255),
    metadata jsonb,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);
ALTER TABLE ONLY public.dl_rider_auth
    ADD CONSTRAINT dl_rider_auth_pkey PRIMARY KEY (rider_auth_id);
ALTER TABLE ONLY public.dl_rider_auth
    ADD CONSTRAINT dl_rider_auth_rider_id_key UNIQUE (rider_id);
  END IF;
END
$sync$;

-- dl_rider_cod_wallet
DO $sync$
BEGIN
  IF to_regclass('public.dl_rider_cod_wallet') IS NULL THEN
CREATE TABLE public.dl_rider_cod_wallet (
    wallet_id uuid DEFAULT gen_random_uuid() NOT NULL,
    rider_id uuid NOT NULL,
    delivery_company_id uuid NOT NULL,
    cod_limit numeric DEFAULT 0 NOT NULL,
    cod_balance numeric DEFAULT 0 NOT NULL,
    risk_level character varying(20) DEFAULT 'low'::character varying NOT NULL,
    is_cod_blocked boolean DEFAULT false NOT NULL,
    last_collection_at timestamp without time zone,
    metadata jsonb,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);
ALTER TABLE ONLY public.dl_rider_cod_wallet
    ADD CONSTRAINT dl_rider_cod_wallet_pkey PRIMARY KEY (wallet_id);
ALTER TABLE ONLY public.dl_rider_cod_wallet
    ADD CONSTRAINT dl_rider_cod_wallet_rider_id_key UNIQUE (rider_id);
CREATE INDEX idx_dl_rider_cod_wallet_company ON public.dl_rider_cod_wallet USING btree (delivery_company_id);
  END IF;
END
$sync$;

-- dl_rider_document
DO $sync$
BEGIN
  IF to_regclass('public.dl_rider_document') IS NULL THEN
CREATE TABLE public.dl_rider_document (
    document_id uuid DEFAULT gen_random_uuid() NOT NULL,
    document_ref character varying(50) NOT NULL,
    rider_id uuid NOT NULL,
    document_type character varying(100) NOT NULL,
    document_name character varying(255),
    document_number character varying(255),
    issue_date date,
    expiry_date date,
    status character varying(50) DEFAULT 'pending'::character varying NOT NULL,
    approved_details jsonb,
    rejected_details jsonb,
    document_details jsonb,
    notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    created_by character varying(100),
    deleted_at timestamp without time zone
);
ALTER TABLE ONLY public.dl_rider_document
    ADD CONSTRAINT dl_rider_document_document_ref_key UNIQUE (document_ref);
ALTER TABLE ONLY public.dl_rider_document
    ADD CONSTRAINT dl_rider_document_pkey PRIMARY KEY (document_id);
CREATE INDEX idx_dl_rider_document_rider_id ON public.dl_rider_document USING btree (rider_id);
CREATE INDEX idx_dl_rider_document_status ON public.dl_rider_document USING btree (status);
CREATE INDEX idx_dl_rider_document_type ON public.dl_rider_document USING btree (document_type);
  END IF;
END
$sync$;

-- dl_rider_media
DO $sync$
BEGIN
  IF to_regclass('public.dl_rider_media') IS NULL THEN
CREATE TABLE public.dl_rider_media (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    rider_id uuid NOT NULL,
    entity_id uuid,
    entity_type text,
    media_type character varying(20) NOT NULL,
    media_name character varying(255),
    s3_key_original text,
    s3_key_processed text,
    s3_key_thumbnail text,
    status character varying(20) DEFAULT 'under_processing'::character varying NOT NULL,
    category_type text,
    caption text,
    is_published boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone
);
ALTER TABLE ONLY public.dl_rider_media
    ADD CONSTRAINT dl_rider_media_pkey PRIMARY KEY (id);
CREATE INDEX idx_dl_rider_media_entity ON public.dl_rider_media USING btree (entity_type, entity_id);
CREATE INDEX idx_dl_rider_media_rider_id ON public.dl_rider_media USING btree (rider_id);
CREATE INDEX idx_dl_rider_media_status ON public.dl_rider_media USING btree (status);
  END IF;
END
$sync$;

-- dl_rider_presence
DO $sync$
BEGIN
  IF to_regclass('public.dl_rider_presence') IS NULL THEN
CREATE TABLE public.dl_rider_presence (
    rider_presence_id uuid DEFAULT gen_random_uuid() NOT NULL,
    rider_id uuid NOT NULL,
    availability_status character varying(50) DEFAULT 'offline'::character varying NOT NULL,
    last_online_at timestamp without time zone,
    last_offline_at timestamp without time zone,
    last_seen_at timestamp without time zone,
    offline_reason character varying(100),
    last_known_zone character varying(100),
    last_known_city character varying(100),
    active_ride_count integer DEFAULT 0 NOT NULL,
    app_version character varying(50),
    device_model character varying(100),
    os_version character varying(50),
    metadata jsonb,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);
ALTER TABLE ONLY public.dl_rider_presence
    ADD CONSTRAINT dl_rider_presence_pkey PRIMARY KEY (rider_presence_id);
ALTER TABLE ONLY public.dl_rider_presence
    ADD CONSTRAINT dl_rider_presence_rider_id_key UNIQUE (rider_id);
  END IF;
END
$sync$;

-- dl_rider_security_deposit
DO $sync$
BEGIN
  IF to_regclass('public.dl_rider_security_deposit') IS NULL THEN
CREATE TABLE public.dl_rider_security_deposit (
    deposit_id uuid DEFAULT gen_random_uuid() NOT NULL,
    business_reference character varying(50) NOT NULL,
    delivery_company_id uuid NOT NULL,
    rider_id uuid NOT NULL,
    amount numeric NOT NULL,
    deposit_date date NOT NULL,
    collection_method jsonb,
    comments text,
    initiated_by_details jsonb,
    status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    metadata jsonb,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    verified_detail jsonb,
    rejected_detail jsonb
);
ALTER TABLE ONLY public.dl_rider_security_deposit
    ADD CONSTRAINT dl_security_deposit_business_reference_key UNIQUE (business_reference);
ALTER TABLE ONLY public.dl_rider_security_deposit
    ADD CONSTRAINT dl_security_deposit_pkey PRIMARY KEY (deposit_id);
CREATE INDEX idx_dl_rider_security_deposit_company ON public.dl_rider_security_deposit USING btree (delivery_company_id);
CREATE INDEX idx_dl_rider_security_deposit_rider ON public.dl_rider_security_deposit USING btree (rider_id);
CREATE INDEX idx_dl_rider_security_deposit_status ON public.dl_rider_security_deposit USING btree (status);
  END IF;
END
$sync$;

-- dl_rider_vehicle
DO $sync$
BEGIN
  IF to_regclass('public.dl_rider_vehicle') IS NULL THEN
CREATE TABLE public.dl_rider_vehicle (
    vehicle_id uuid DEFAULT gen_random_uuid() NOT NULL,
    vehicle_ref character varying(50) NOT NULL,
    rider_id uuid NOT NULL,
    vehicle_type character varying(100),
    vehicle_number character varying(100),
    vehicle_details jsonb,
    is_primary boolean DEFAULT false NOT NULL,
    status character varying(50) DEFAULT 'pending'::character varying NOT NULL,
    verified_details jsonb,
    rejected_details jsonb,
    notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    created_by character varying(100),
    deleted_at timestamp without time zone
);
ALTER TABLE ONLY public.dl_rider_vehicle
    ADD CONSTRAINT dl_rider_vehicle_pkey PRIMARY KEY (vehicle_id);
ALTER TABLE ONLY public.dl_rider_vehicle
    ADD CONSTRAINT dl_rider_vehicle_vehicle_ref_key UNIQUE (vehicle_ref);
CREATE INDEX idx_dl_rider_vehicle_rider_id ON public.dl_rider_vehicle USING btree (rider_id);
CREATE INDEX idx_dl_rider_vehicle_status ON public.dl_rider_vehicle USING btree (status);
  END IF;
END
$sync$;
`);
};

exports.down = () => {
  // Intentionally empty. See header.
};
