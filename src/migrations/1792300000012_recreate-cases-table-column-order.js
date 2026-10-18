/**
 * Recreate public.cases with a readable column order and add raised_on_behalf_type
 *
 * PostgreSQL cannot reorder columns, so the table is rebuilt: lock, copy into public.cases_reordered,
 * check the row count, drop the old table, rename, re-add the keys and indexes with their old names, then
 * ANALYZE the new table so the planner has statistics straight away.
 * Rows are preserved. This runs on PRODUCTION with every deploy, so up() is guarded:
 *   - already rebuilt (raised_on_behalf_type present): does nothing and takes no lock;
 *   - otherwise it sets lock_timeout to 5s (SET LOCAL: until the migration transaction ends) and takes
 *     ACCESS EXCLUSIVE on public.cases. If a long query holds the table, the migration fails after 5s
 *     (re-run the deploy) instead of queueing all case traffic behind it. The checks below run under the lock:
 *   - a column the copy needs is missing (migrations 1792300000010/11 not applied): stops with an error;
 *   - something it would not recreate exists (a foreign key, view, trigger, index or constraint, explicit
 *     grants, a publication, a table or column comment): stops with an error
 *     (it never uses CASCADE, so nothing is dropped silently).
 * initiator_detail is folded into initiated_by_details where that is empty, and is itself kept (as the last
 * column): the riwayat-case-manager that runs until the apps are redeployed still writes it, so dropping it
 * here would break case creation in between. 1792300000015 drops it in the next release.
 * New column raised_on_behalf_type (varchar 50) with index idx_cases_raised_on_behalf.
 *
 * down() does nothing: no column was removed, and restoring the old order would need another rebuild.
 */

exports.up = (pgm) => {
  pgm.sql(String.raw`
DO $recreate$
DECLARE
  required_cols text[] := ARRAY[
    'case_id', 'case_number', 'title', 'description', 'case_category', 'case_type', 'case_subtype',
    'primary_entity_type', 'primary_entity_id', 'primary_entity_business_reference',
    'initiated_by_role', 'initiated_by_id', 'initiated_by_details', 'initiator_detail',
    'raised_on_behalf_id', 'raised_on_behalf_details',
    'status', 'priority', 'sla_due_at', 'is_internal',
    'assigned_dc_user', 'assigned_dc_user_at', 'assigned_dc_user_details',
    'assigned_team_user', 'assigned_team_user_at', 'assigned_team_user_details',
    'forwarded_to', 'forwarded_to_type', 'idempotency_key', 'dedupe_hash',
    'created_at', 'updated_at', 'deleted_at'
  ];
  known_indexes text[] := ARRAY[
    'cases_pkey', 'cases_case_number_key', 'uq_cases_idempotency',
    'idx_cases_assigned_dc_user', 'idx_cases_assigned_team_user', 'idx_cases_created_at',
    'idx_cases_dedupe_hash', 'idx_cases_initiated_by', 'idx_cases_primary_entity', 'idx_cases_status',
    'idx_cases_raised_on_behalf'
  ];
  missing_cols    text;
  blockers        text;
  has_type        boolean;
  old_count       bigint;
  copied_count    bigint;
BEGIN
  IF to_regclass('public.cases') IS NULL THEN
    RAISE EXCEPTION 'public.cases does not exist';
  END IF;

  SELECT EXISTS (SELECT 1 FROM pg_attribute WHERE attrelid = 'public.cases'::regclass AND attname = 'raised_on_behalf_type' AND NOT attisdropped)
    INTO has_type;

  IF has_type THEN
    RETURN; -- already rebuilt
  END IF;

  -- Fail fast instead of queueing every case query behind a lock wait on a long-running query.
  -- The checks below run under the lock, so nothing can change between them and the rebuild.
  SET LOCAL lock_timeout = '5s';
  LOCK TABLE public.cases IN ACCESS EXCLUSIVE MODE;

  SELECT string_agg(c, ', ') INTO missing_cols
  FROM unnest(required_cols) AS c
  WHERE NOT EXISTS (SELECT 1 FROM pg_attribute WHERE attrelid = 'public.cases'::regclass AND attname = c AND NOT attisdropped);
  IF missing_cols IS NOT NULL THEN
    RAISE EXCEPTION 'public.cases is missing columns (%); apply migrations 1792300000010 and 1792300000011 first', missing_cols;
  END IF;

  -- Objects this migration would lose or that would block DROP TABLE without CASCADE.
  SELECT string_agg(b, '; ') INTO blockers FROM (
    SELECT format('foreign key %s on %s', conname, conrelid::regclass) AS b
      FROM pg_constraint WHERE confrelid = 'public.cases'::regclass AND contype = 'f'
    UNION ALL
    SELECT DISTINCT format('view %s', r.ev_class::regclass)
      FROM pg_depend d JOIN pg_rewrite r ON r.oid = d.objid
     WHERE d.classid = 'pg_rewrite'::regclass AND d.refobjid = 'public.cases'::regclass AND r.ev_class <> 'public.cases'::regclass
    UNION ALL
    SELECT format('trigger %s', tgname)
      FROM pg_trigger WHERE tgrelid = 'public.cases'::regclass AND NOT tgisinternal
    UNION ALL
    SELECT format('constraint %s', conname)
      FROM pg_constraint
     WHERE conrelid = 'public.cases'::regclass AND contype NOT IN ('n')
       AND conname NOT IN ('cases_pkey', 'cases_case_number_key', 'uq_cases_idempotency')
    UNION ALL
    SELECT format('index %s', indexname)
      FROM pg_indexes WHERE schemaname = 'public' AND tablename = 'cases' AND indexname <> ALL (known_indexes)
    UNION ALL
    SELECT 'explicit grants'
      FROM pg_class WHERE oid = 'public.cases'::regclass AND relacl IS NOT NULL
    UNION ALL
    SELECT format('publication %s', p.pubname)
      FROM pg_publication_rel pr JOIN pg_publication p ON p.oid = pr.prpubid
     WHERE pr.prrelid = 'public.cases'::regclass
    UNION ALL
    SELECT 'table comment'
     WHERE obj_description('public.cases'::regclass, 'pg_class') IS NOT NULL
    UNION ALL
    SELECT format('comment on column %s', attname)
      FROM pg_attribute
     WHERE attrelid = 'public.cases'::regclass AND attnum > 0 AND NOT attisdropped
       AND col_description('public.cases'::regclass, attnum) IS NOT NULL
  ) found;
  IF blockers IS NOT NULL THEN
    RAISE EXCEPTION 'public.cases has objects this migration would not recreate: %', blockers;
  END IF;

  CREATE TABLE public.cases_reordered (
    case_id                           uuid CONSTRAINT cases_case_id_not_null NOT NULL DEFAULT gen_random_uuid(),
    case_number                       character varying(50) CONSTRAINT cases_case_number_not_null NOT NULL,
    title                             character varying(255) DEFAULT NULL::character varying,
    description                       text,
    case_category                     character varying(100) CONSTRAINT cases_case_category_not_null NOT NULL,
    case_type                         character varying(100) CONSTRAINT cases_case_type_not_null NOT NULL,
    case_subtype                      character varying(100) CONSTRAINT cases_case_subtype_not_null NOT NULL,
    primary_entity_type               character varying(50),
    primary_entity_id                 uuid,
    primary_entity_business_reference character varying(100),
    initiated_by_role                 character varying(50),
    initiated_by_id                   uuid CONSTRAINT cases_initiated_by_id_not_null NOT NULL,
    initiated_by_details              jsonb,
    raised_on_behalf_type             character varying(50),
    raised_on_behalf_id               uuid,
    raised_on_behalf_details          jsonb,
    status                            character varying(50) CONSTRAINT cases_status_not_null NOT NULL,
    priority                          character varying(20) DEFAULT NULL::character varying,
    sla_due_at                        timestamp with time zone,
    is_internal                       boolean CONSTRAINT cases_is_internal_not_null NOT NULL DEFAULT false,
    assigned_dc_user                  uuid,
    assigned_dc_user_at               timestamp with time zone,
    assigned_dc_user_details          jsonb,
    assigned_team_user                uuid,
    assigned_team_user_at             timestamp with time zone,
    assigned_team_user_details        jsonb,
    forwarded_to                      uuid,
    forwarded_to_type                 character varying(50) DEFAULT NULL::character varying,
    idempotency_key                   character varying(255) DEFAULT NULL::character varying,
    dedupe_hash                       character varying(64) DEFAULT NULL::character varying,
    created_at                        timestamp with time zone CONSTRAINT cases_created_at_not_null NOT NULL DEFAULT now(),
    updated_at                        timestamp with time zone CONSTRAINT cases_updated_at_not_null NOT NULL DEFAULT now(),
    deleted_at                        timestamp with time zone,
    initiator_detail                  jsonb
  );

  SELECT count(*) INTO old_count FROM public.cases;

  -- raised_on_behalf_type is new (NULL); it is copied only when a previous down() left it in place.
  EXECUTE format($copy$
  INSERT INTO public.cases_reordered (
    case_id, case_number, title, description, case_category, case_type, case_subtype,
    primary_entity_type, primary_entity_id, primary_entity_business_reference,
    initiated_by_role, initiated_by_id, initiated_by_details,
    raised_on_behalf_type, raised_on_behalf_id, raised_on_behalf_details,
    status, priority, sla_due_at, is_internal,
    assigned_dc_user, assigned_dc_user_at, assigned_dc_user_details,
    assigned_team_user, assigned_team_user_at, assigned_team_user_details,
    forwarded_to, forwarded_to_type, idempotency_key, dedupe_hash,
    created_at, updated_at, deleted_at, initiator_detail
  )
  SELECT
    case_id, case_number, title, description, case_category, case_type, case_subtype,
    primary_entity_type, primary_entity_id, primary_entity_business_reference,
    initiated_by_role, initiated_by_id,
    CASE WHEN initiated_by_details IS NULL AND jsonb_typeof(initiator_detail) = 'object' THEN initiator_detail ELSE initiated_by_details END,
    %s, raised_on_behalf_id, raised_on_behalf_details,
    status, priority, sla_due_at, is_internal,
    assigned_dc_user, assigned_dc_user_at, assigned_dc_user_details,
    assigned_team_user, assigned_team_user_at, assigned_team_user_details,
    forwarded_to, forwarded_to_type, idempotency_key, dedupe_hash,
    created_at, updated_at, deleted_at, initiator_detail
  FROM public.cases
  $copy$, CASE WHEN has_type THEN 'raised_on_behalf_type' ELSE 'NULL::character varying' END);
  GET DIAGNOSTICS copied_count = ROW_COUNT;

  IF copied_count <> old_count THEN
    RAISE EXCEPTION 'cases copy row count mismatch: % in cases, % copied', old_count, copied_count;
  END IF;

  DROP TABLE public.cases;
  ALTER TABLE public.cases_reordered RENAME TO cases;

  ALTER TABLE public.cases ADD CONSTRAINT cases_pkey PRIMARY KEY (case_id);
  ALTER TABLE public.cases ADD CONSTRAINT cases_case_number_key UNIQUE (case_number);
  ALTER TABLE public.cases ADD CONSTRAINT uq_cases_idempotency UNIQUE (idempotency_key);

  CREATE INDEX idx_cases_assigned_dc_user ON public.cases USING btree (assigned_dc_user);
  CREATE INDEX idx_cases_assigned_team_user ON public.cases USING btree (assigned_team_user);
  CREATE INDEX idx_cases_created_at ON public.cases USING btree (created_at DESC);
  CREATE INDEX idx_cases_dedupe_hash ON public.cases USING btree (dedupe_hash);
  CREATE INDEX idx_cases_initiated_by ON public.cases USING btree (initiated_by_id);
  CREATE INDEX idx_cases_primary_entity ON public.cases USING btree (primary_entity_type, primary_entity_id);
  CREATE INDEX idx_cases_status ON public.cases USING btree (status);
  CREATE INDEX idx_cases_raised_on_behalf ON public.cases USING btree (raised_on_behalf_type, raised_on_behalf_id);

  ANALYZE public.cases;
END
$recreate$;
`);
};

// Nothing to undo: no column was removed (raised_on_behalf_type and its index are kept, as dropping them
// would lose data), and restoring the old column order would need another rebuild.
exports.down = () => {};
