/**
 * Sync with production: trigger functions
 *
 * Part of the production schema sync. Generated from a read-only schema dump of the shared
 * dev/production database (2026-10-17) and compared with a database built from master.
 * Every statement is guarded: on production (where these objects already exist) it does nothing;
 * on a fresh database it recreates what production has.
 * down() is intentionally a no-op so that migrate:down can never drop live tables or data.
 * 
 * Functions: set_updated_at, update_promotion_target_dishes_staging_updated_at, update_promotion_target_kitchens_staging_updated_at
 */

exports.up = (pgm) => {
  pgm.sql(String.raw`
DO $sync$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'set_updated_at' AND pronamespace = 'public'::regnamespace) THEN
CREATE FUNCTION public.set_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;
  END IF;
END
$sync$;

DO $sync$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_promotion_target_dishes_staging_updated_at' AND pronamespace = 'public'::regnamespace) THEN
CREATE FUNCTION public.update_promotion_target_dishes_staging_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $$;
  END IF;
END
$sync$;

DO $sync$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_promotion_target_kitchens_staging_updated_at' AND pronamespace = 'public'::regnamespace) THEN
CREATE FUNCTION public.update_promotion_target_kitchens_staging_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $$;
  END IF;
END
$sync$;
`);
};

exports.down = () => {
  // Intentionally empty. See header.
};
