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
 * up() is idempotent: it runs only while the columns still exist. Before the drop, every actor_name /
 * actor_role value is merged into actor_details as name / userEntityType wherever actor_details lacks that
 * key (rows with no actor_details get { name, userEntityType, reference: null }), so no value is lost. If a
 * row's actor_details is not a JSON object the values cannot be merged and up() stops with an error.
 * Then both columns are dropped. On t3 no index, view, trigger or constraint uses them. It never uses
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
DECLARE
  col_count  int;
  unmergable bigint;
BEGIN
  IF to_regclass('public.case_activity') IS NULL THEN
    RAISE EXCEPTION 'public.case_activity does not exist';
  END IF;

  SELECT count(*) INTO col_count FROM pg_attribute
   WHERE attrelid = 'public.case_activity'::regclass AND attname IN ('actor_name', 'actor_role') AND NOT attisdropped;
  IF col_count = 0 THEN
    RETURN; -- already dropped
  ELSIF col_count = 1 THEN
    RAISE EXCEPTION 'public.case_activity has only one of actor_name / actor_role; restore the other before running this migration';
  END IF;

  SELECT count(*) INTO unmergable FROM public.case_activity
   WHERE actor_details IS NOT NULL AND jsonb_typeof(actor_details) <> 'object'
     AND (actor_name IS NOT NULL OR actor_role IS NOT NULL);
  IF unmergable > 0 THEN
    RAISE EXCEPTION '% case_activity rows have actor_name/actor_role but a non-object actor_details; fix them before dropping the columns', unmergable;
  END IF;

  UPDATE public.case_activity
     SET actor_details = COALESCE(actor_details, jsonb_build_object('reference', NULL))
                         || jsonb_strip_nulls(jsonb_build_object(
                              'name',           CASE WHEN actor_details->>'name' IS NULL THEN actor_name END,
                              'userEntityType', CASE WHEN actor_details->>'userEntityType' IS NULL THEN actor_role END))
   WHERE (actor_details IS NULL OR jsonb_typeof(actor_details) = 'object')
     AND ((actor_name IS NOT NULL AND actor_details->>'name' IS NULL)
       OR (actor_role IS NOT NULL AND actor_details->>'userEntityType' IS NULL));

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
