/**
 * Sync with production: Wallet and loyalty
 *
 * Part of the production schema sync. Generated from a read-only schema dump of the shared
 * dev/production database (2026-10-17) and compared with a database built from master.
 * Every statement is guarded: on production (where these objects already exist) it does nothing;
 * on a fresh database it recreates what production has.
 * down() is intentionally a no-op so that migrate:down can never drop live tables or data.
 * 
 * Tables: loyalty_awards, wallet_accounts
 * Foreign keys are added in the "new-table-foreign-keys" migration.
 * wallet_ledger is not recreated: it is obsolete (customer_wallet_ledger replaces it) and
 * 1779900000005_drop-obsolete-wallet-ledger-table drops it.
 */

exports.up = (pgm) => {
  pgm.sql(String.raw`
-- loyalty_awards
DO $sync$
BEGIN
  IF to_regclass('public.loyalty_awards') IS NULL THEN
CREATE SEQUENCE IF NOT EXISTS public.loyalty_awards_award_id_seq1
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
CREATE TABLE public.loyalty_awards (
    award_id bigint NOT NULL,
    wallet_account_id bigint NOT NULL,
    award_type character varying(30) NOT NULL,
    award_source_id character varying(100) NOT NULL,
    order_id character varying(50),
    points_earned numeric(12,2) NOT NULL,
    remaining_points numeric(12,2) NOT NULL,
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    expires_at timestamp without time zone,
    rule_version character varying(20),
    rule_snapshot jsonb,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT loyalty_awards_points_earned_check CHECK ((points_earned > (0)::numeric)),
    CONSTRAINT loyalty_awards_remaining_points_check CHECK ((remaining_points >= (0)::numeric))
);
ALTER SEQUENCE public.loyalty_awards_award_id_seq1 OWNED BY public.loyalty_awards.award_id;
ALTER TABLE ONLY public.loyalty_awards ALTER COLUMN award_id SET DEFAULT nextval('public.loyalty_awards_award_id_seq1'::regclass);
ALTER TABLE ONLY public.loyalty_awards
    ADD CONSTRAINT loyalty_awards_pkey1 PRIMARY KEY (award_id);
  END IF;
END
$sync$;

-- wallet_accounts
DO $sync$
BEGIN
  IF to_regclass('public.wallet_accounts') IS NULL THEN
CREATE SEQUENCE IF NOT EXISTS public.wallet_accounts_wallet_account_id_seq1
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
CREATE TABLE public.wallet_accounts (
    wallet_account_id bigint NOT NULL,
    customer_id character varying(50) NOT NULL,
    balance_points numeric(12,2) DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);
ALTER SEQUENCE public.wallet_accounts_wallet_account_id_seq1 OWNED BY public.wallet_accounts.wallet_account_id;
ALTER TABLE ONLY public.wallet_accounts ALTER COLUMN wallet_account_id SET DEFAULT nextval('public.wallet_accounts_wallet_account_id_seq1'::regclass);
ALTER TABLE ONLY public.wallet_accounts
    ADD CONSTRAINT wallet_accounts_customer_id_key1 UNIQUE (customer_id);
ALTER TABLE ONLY public.wallet_accounts
    ADD CONSTRAINT wallet_accounts_pkey1 PRIMARY KEY (wallet_account_id);
  END IF;
END
$sync$;
`);
};

exports.down = () => {
  // Intentionally empty. See header.
};
