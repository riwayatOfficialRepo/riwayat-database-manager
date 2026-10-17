/**
 * Sync with production: Notifications
 *
 * Part of the production schema sync. Generated from a read-only schema dump of the shared
 * dev/production database (2026-10-17) and compared with a database built from master.
 * Every statement is guarded: on production (where these objects already exist) it does nothing;
 * on a fresh database it recreates what production has.
 * down() is intentionally a no-op so that migrate:down can never drop live tables or data.
 * 
 * Tables: notifications, test_notifications
 * Foreign keys are added in the "new-table-foreign-keys" migration.
 */

exports.up = (pgm) => {
  pgm.sql(String.raw`
-- notifications
DO $sync$
BEGIN
  IF to_regclass('public.notifications') IS NULL THEN
CREATE SEQUENCE IF NOT EXISTS public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
CREATE TABLE public.notifications (
    id integer NOT NULL,
    notification_id uuid DEFAULT gen_random_uuid() NOT NULL,
    event_code character varying(100) NOT NULL,
    event_log_id uuid,
    target_address character varying(300),
    user_id character varying(100) NOT NULL,
    role character varying(50) NOT NULL,
    channel character varying(20) NOT NULL,
    template_id character varying(200) NOT NULL,
    payload jsonb NOT NULL,
    lang_code character varying(10) DEFAULT 'en'::character varying NOT NULL,
    status character varying(20) DEFAULT 'PENDING'::character varying NOT NULL,
    delivery_attempts integer DEFAULT 0 NOT NULL,
    failure_reason text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    last_attempt_at timestamp with time zone,
    delivered_at timestamp with time zone,
    sent_at timestamp with time zone,
    kitchen_id uuid,
    CONSTRAINT notifications_channel_check CHECK (((channel)::text = ANY ((ARRAY['email'::character varying, 'sms'::character varying, 'push'::character varying, 'in_app'::character varying])::text[]))),
    CONSTRAINT notifications_status_check CHECK (((status)::text = ANY ((ARRAY['PENDING'::character varying, 'DELIVERED'::character varying, 'FAILED'::character varying])::text[])))
);
ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;
ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);
ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_notification_id_key UNIQUE (notification_id);
ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);
CREATE INDEX idx_notifications_created_at ON public.notifications USING btree (created_at);
CREATE INDEX idx_notifications_event_code ON public.notifications USING btree (event_code);
CREATE INDEX idx_notifications_status ON public.notifications USING btree (status);
CREATE INDEX idx_notifications_user_id ON public.notifications USING btree (user_id);
  END IF;
END
$sync$;

-- test_notifications
DO $sync$
BEGIN
  IF to_regclass('public.test_notifications') IS NULL THEN
CREATE SEQUENCE IF NOT EXISTS public.test_notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
CREATE TABLE public.test_notifications (
    id integer NOT NULL,
    notification_id uuid,
    template_id character varying(255),
    channel character varying(50),
    target_address character varying(255),
    subject_rendered text,
    body_rendered text,
    payload jsonb,
    status character varying(50) DEFAULT 'pending'::character varying,
    created_at timestamp with time zone DEFAULT now(),
    sent_at timestamp with time zone
);
ALTER SEQUENCE public.test_notifications_id_seq OWNED BY public.test_notifications.id;
ALTER TABLE ONLY public.test_notifications ALTER COLUMN id SET DEFAULT nextval('public.test_notifications_id_seq'::regclass);
ALTER TABLE ONLY public.test_notifications
    ADD CONSTRAINT test_notifications_pkey PRIMARY KEY (id);
  END IF;
END
$sync$;
`);
};

exports.down = () => {
  // Intentionally empty. See header.
};
