/**
 * Drop actor_name and actor_role from public.case_activity; actor_details is the only actor record
 *
 * actor_details ({ name, userEntityType, reference }) already holds the actor's name and type, so the two
 * flat columns only duplicated it, and reads fell back to them where actor_details was NULL. riwayat-case-manager
 * now always writes actor_details (built from actorName / actorRole when an event has none) and reads only it.
 *
 * up() is idempotent: it runs only while either column still exists. Rows with no actor_details first get
 * them from the two columns (reference NULL), then both columns are dropped. On t3 no index, view, trigger or
 * constraint uses them other than actor_role's own NOT NULL, which goes with the column. It never uses CASCADE,
 * so if an object depends on either column the DROP fails instead of removing it silently.
 *
 * DEPLOY ORDER: the case worker (riwayat-worker) must run the riwayat-case-manager version that no longer writes
 * actor_name / actor_role BEFORE this migration is applied; the old version's INSERT names both columns and fails
 * once they are gone. Note that actor_role is NOT NULL: the new version does not write it, so its activity
 * INSERTs fail until this migration has run. Keep the gap between the worker deploy and this migration short,
 * or drop that NOT NULL first in a separate, earlier migration.
 *
 * down() never drops data: it re-adds the two columns if missing (actor_role varchar(30), actor_name varchar,
 * as in 1772777687818_create-case-activity-table) and fills them from actor_details. actor_role gets back its
 * NOT NULL only when every row has a value. actor_details is kept as it is.
 */

exports.up = (pgm) => {
  pgm.sql(String.raw`
DO $drop_actor$
BEGIN
  IF to_regclass('public.case_activity') IS NULL THEN
    RAISE EXCEPTION 'public.case_activity does not exist';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_attribute
     WHERE attrelid = 'public.case_activity'::regclass AND attname IN ('actor_name', 'actor_role') AND NOT attisdropped
  ) THEN
    RETURN; -- already dropped
  END IF;

  -- One column may be gone if an earlier run was interrupted; read the missing one as NULL.
  EXECUTE format($fill$
  UPDATE public.case_activity
     SET actor_details = jsonb_build_object('name', %1$s, 'userEntityType', %2$s, 'reference', NULL)
   WHERE actor_details IS NULL AND (%1$s IS NOT NULL OR %2$s IS NOT NULL)
  $fill$,
    CASE WHEN EXISTS (SELECT 1 FROM pg_attribute WHERE attrelid = 'public.case_activity'::regclass AND attname = 'actor_name' AND NOT attisdropped)
         THEN 'actor_name' ELSE 'NULL::text' END,
    CASE WHEN EXISTS (SELECT 1 FROM pg_attribute WHERE attrelid = 'public.case_activity'::regclass AND attname = 'actor_role' AND NOT attisdropped)
         THEN 'actor_role' ELSE 'NULL::text' END);

  ALTER TABLE public.case_activity DROP COLUMN IF EXISTS actor_name, DROP COLUMN IF EXISTS actor_role;
END
$drop_actor$;
`);
};

exports.down = (pgm) => {
  pgm.sql(String.raw`
DO $restore_actor$
BEGIN
  IF to_regclass('public.case_activity') IS NULL THEN
    RETURN;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_attribute WHERE attrelid = 'public.case_activity'::regclass AND attname = 'actor_role' AND NOT attisdropped) THEN
    ALTER TABLE public.case_activity ADD COLUMN actor_role character varying(30);
    UPDATE public.case_activity SET actor_role = left(actor_details->>'userEntityType', 30);
    IF NOT EXISTS (SELECT 1 FROM public.case_activity WHERE actor_role IS NULL) THEN
      ALTER TABLE public.case_activity ALTER COLUMN actor_role SET NOT NULL;
    END IF;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_attribute WHERE attrelid = 'public.case_activity'::regclass AND attname = 'actor_name' AND NOT attisdropped) THEN
    ALTER TABLE public.case_activity ADD COLUMN actor_name character varying;
    UPDATE public.case_activity SET actor_name = actor_details->>'name';
  END IF;
END
$restore_actor$;
`);
};
