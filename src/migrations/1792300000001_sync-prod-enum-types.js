/**
 * Sync with production: enum types
 *
 * Part of the production schema sync. Generated from a read-only schema dump of the shared
 * dev/production database (2026-10-17) and compared with a database built from master.
 * Every statement is guarded: on production (where these objects already exist) it does nothing;
 * on a fresh database it recreates what production has.
 * down() is intentionally a no-op so that migrate:down can never drop live tables or data.
 * 
 * Types: case_activity_visibility, case_entity_visibility
 */

exports.up = (pgm) => {
  pgm.sql(String.raw`
DO $sync$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'case_activity_visibility' AND typnamespace = 'public'::regnamespace) THEN
CREATE TYPE public.case_activity_visibility AS ENUM (
    'PUBLIC',
    'INTERNAL'
);
  END IF;
END
$sync$;

DO $sync$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'case_entity_visibility' AND typnamespace = 'public'::regnamespace) THEN
CREATE TYPE public.case_entity_visibility AS ENUM (
    'PUBLIC',
    'INTERNAL'
);
  END IF;
END
$sync$;
`);
};

exports.down = () => {
  // Intentionally empty. See header.
};
