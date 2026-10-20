/**
 * Drop actor_name and actor_role from public.case_activity; actor_details is the only actor record
 * (step 2 of 2, after 1792300000014_make-case-activity-actor-role-nullable)
 *
 * DEPLOY ONLY AFTER riwayat-worker AND riwayat-case-service RUN THE NEW riwayat-case-manager (the version that
 * always writes actor_details and no longer writes or reads actor_name / actor_role). That version ships in a
 * later PR / separate release; this migration belongs to that release (release 2), never to the release that
 * carries 1792300000012-14 (release 1). The old version's activity INSERT names both columns and fails as
 * soon as they are gone.
 *
 * actor_details ({ name, userEntityType, reference }) already holds the actor's name and type, so the two
 * flat columns only duplicated it.
 *
 * up() is idempotent: it runs only while either column still exists. Rows with no actor_details first get
 * them from the two columns (reference NULL), again, for rows the old version wrote after 1792300000014 ran;
 * then both columns are dropped. On t3 no index, view, trigger or constraint uses them. It never uses
 * CASCADE, so if an object depends on either column the DROP fails instead of removing it silently.
 * lock_timeout is 5s (SET LOCAL) so the DROP fails fast instead of queueing case_activity traffic behind a
 * long query; re-run the deploy if it times out.
 *
 * down() never drops data: it re-adds the two columns if missing (actor_role varchar(30), actor_name varchar,
 * as in 1772777687818_create-case-activity-table) and fills them from actor_details. actor_role is left
 * nullable, the state 1792300000014 leaves it in, because the new riwayat-case-manager does not write it;
 * 1792300000014's down() restores the NOT NULL. actor_details is kept as it is.
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

  SET LOCAL lock_timeout = '5s';
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
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_attribute WHERE attrelid = 'public.case_activity'::regclass AND attname = 'actor_name' AND NOT attisdropped) THEN
    ALTER TABLE public.case_activity ADD COLUMN actor_name character varying;
    UPDATE public.case_activity SET actor_name = actor_details->>'name';
  END IF;
END
$restore_actor$;
`);
};
