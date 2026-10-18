/**
 * Drop public.cases.initiator_detail; initiated_by_details is the only initiator record (release 2)
 *
 * DEPLOY ONLY AFTER riwayat-worker AND riwayat-case-service RUN THE NEW riwayat-case-manager (the version that
 * no longer writes initiator_detail). 1792300000012 keeps the column for that reason; the old version names it
 * in its case INSERT and fails as soon as it is gone. Ships with 1792300000015, never with 1792300000012-14.
 *
 * up() is idempotent: it runs only while the column exists. Rows whose initiated_by_details is empty first
 * get initiator_detail (when it is a JSON object), for rows the old version wrote after 1792300000012 ran;
 * then the column is dropped. It never uses CASCADE, so if an object depends on the column the DROP fails
 * instead of removing it silently. lock_timeout is 5s (SET LOCAL) so the DROP fails fast instead of queueing
 * case traffic behind a long query; re-run the deploy if it times out.
 *
 * down() never drops data: it re-adds the column (jsonb, as in 1792300000010) and fills it from
 * initiated_by_details.
 */

exports.up = (pgm) => {
  pgm.sql(String.raw`
DO $drop_initiator_detail$
BEGIN
  IF to_regclass('public.cases') IS NULL THEN
    RAISE EXCEPTION 'public.cases does not exist';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_attribute WHERE attrelid = 'public.cases'::regclass AND attname = 'initiator_detail' AND NOT attisdropped) THEN
    RETURN; -- already dropped
  END IF;

  UPDATE public.cases
     SET initiated_by_details = initiator_detail
   WHERE initiated_by_details IS NULL AND jsonb_typeof(initiator_detail) = 'object';

  SET LOCAL lock_timeout = '5s';
  ALTER TABLE public.cases DROP COLUMN IF EXISTS initiator_detail;
END
$drop_initiator_detail$;
`);
};

exports.down = (pgm) => {
  pgm.sql(String.raw`
DO $restore_initiator_detail$
BEGIN
  IF to_regclass('public.cases') IS NOT NULL AND NOT EXISTS (SELECT 1 FROM pg_attribute WHERE attrelid = 'public.cases'::regclass AND attname = 'initiator_detail' AND NOT attisdropped) THEN
    ALTER TABLE public.cases ADD COLUMN initiator_detail jsonb;
    UPDATE public.cases SET initiator_detail = initiated_by_details;
  END IF;
END
$restore_initiator_detail$;
`);
};
