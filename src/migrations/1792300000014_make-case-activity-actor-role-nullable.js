/**
 * Make public.case_activity.actor_role nullable and backfill actor_details (step 1 of 2 for dropping
 * actor_name / actor_role)
 *
 * actor_details ({ name, userEntityType, reference }) already holds the actor's name and type, so the flat
 * actor_name / actor_role columns only duplicate it. The new riwayat-case-manager always writes actor_details
 * and no longer writes actor_role, so actor_role's NOT NULL must go before that version runs; the old version
 * still writes both columns and keeps working, because both columns stay.
 *
 * up() is idempotent: rows with no actor_details get them from the two columns (reference NULL), read only
 * while the columns exist; then actor_role's NOT NULL is dropped only if the column exists and is still
 * NOT NULL. lock_timeout is 5s (SET LOCAL) so the ALTER fails fast instead of queueing case_activity traffic
 * behind a long query; re-run the deploy if it times out.
 *
 * DEPLOY ORDER (two releases):
 *   Release 1: run migrations 1792300000012, 1792300000013 and this one (1792300000014), THEN deploy
 *              riwayat-worker and riwayat-case-service with the new riwayat-case-manager.
 *   Release 2: 1792300000015_drop-case-activity-actor-role-name (drops both columns). It ships in a later
 *              PR / separate release, and only after every riwayat-worker and riwayat-case-service instance
 *              runs the new riwayat-case-manager.
 *
 * down() restores actor_role's NOT NULL only when no row has a NULL actor_role (NULLs are first filled from
 * actor_details.userEntityType). If NULLs remain it leaves the column nullable and raises a NOTICE: setting
 * NOT NULL would fail, and inventing a role would write false data. actor_details is kept as it is.
 */

exports.up = (pgm) => {
  pgm.sql(String.raw`
DO $actor_role_nullable$
BEGIN
  IF to_regclass('public.case_activity') IS NULL THEN
    RAISE EXCEPTION 'public.case_activity does not exist';
  END IF;

  -- Read a missing column as NULL, so this also works if one of them is already gone.
  IF EXISTS (
    SELECT 1 FROM pg_attribute
     WHERE attrelid = 'public.case_activity'::regclass AND attname IN ('actor_name', 'actor_role') AND NOT attisdropped
  ) THEN
    EXECUTE format($fill$
    UPDATE public.case_activity
       SET actor_details = jsonb_build_object('name', %1$s, 'userEntityType', %2$s, 'reference', NULL)
     WHERE actor_details IS NULL AND (%1$s IS NOT NULL OR %2$s IS NOT NULL)
    $fill$,
      CASE WHEN EXISTS (SELECT 1 FROM pg_attribute WHERE attrelid = 'public.case_activity'::regclass AND attname = 'actor_name' AND NOT attisdropped)
           THEN 'actor_name' ELSE 'NULL::text' END,
      CASE WHEN EXISTS (SELECT 1 FROM pg_attribute WHERE attrelid = 'public.case_activity'::regclass AND attname = 'actor_role' AND NOT attisdropped)
           THEN 'actor_role' ELSE 'NULL::text' END);
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_attribute
     WHERE attrelid = 'public.case_activity'::regclass AND attname = 'actor_role' AND NOT attisdropped AND attnotnull
  ) THEN
    SET LOCAL lock_timeout = '5s';
    ALTER TABLE public.case_activity ALTER COLUMN actor_role DROP NOT NULL;
  END IF;
END
$actor_role_nullable$;
`);
};

exports.down = (pgm) => {
  pgm.sql(String.raw`
DO $actor_role_not_null$
BEGIN
  IF to_regclass('public.case_activity') IS NULL OR NOT EXISTS (
    SELECT 1 FROM pg_attribute
     WHERE attrelid = 'public.case_activity'::regclass AND attname = 'actor_role' AND NOT attisdropped AND NOT attnotnull
  ) THEN
    RETURN; -- no table, no column, or already NOT NULL
  END IF;

  UPDATE public.case_activity
     SET actor_role = left(actor_details->>'userEntityType', 30)
   WHERE actor_role IS NULL AND actor_details->>'userEntityType' IS NOT NULL;

  IF EXISTS (SELECT 1 FROM public.case_activity WHERE actor_role IS NULL) THEN
    -- Rows written by the new riwayat-case-manager without a role cannot satisfy NOT NULL; leave it nullable.
    RAISE NOTICE 'public.case_activity.actor_role has NULL values; NOT NULL was not restored';
    RETURN;
  END IF;

  SET LOCAL lock_timeout = '5s';
  ALTER TABLE public.case_activity ALTER COLUMN actor_role SET NOT NULL;
END
$actor_role_not_null$;
`);
};
