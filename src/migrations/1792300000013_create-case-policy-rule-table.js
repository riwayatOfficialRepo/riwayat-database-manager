/**
 * Create case_policy_rule and seed it: the two-level case taxonomy (category -> case_type)
 *
 * One row per (case_category, case_type). It decides who may raise the type (allowed_raisers:
 * CUSTOMER, KITCHEN, TEAM), which subject types it accepts, its priority, its SLA in hours and whether
 * it is internal (TEAM only), and its status (ACTIVE | INACTIVE). riwayat-case-manager reads only ACTIVE
 * rows; the old third level (case_subtype) is now always stored equal to case_type.
 *
 * up() is idempotent: the table is created only if it does not exist (createTable ifNotExists), each named
 * constraint is added only if missing, the updated_at trigger (set_updated_at(), as in 1792300000010) is
 * created only if missing, and the seed uses ON CONFLICT (case_category, case_type) DO NOTHING, so rows
 * edited later in production are never overwritten. No extra indexes: the unique constraint covers the lookups.
 *
 * The 6 SYSTEM_GENERATED_COMPLAINTS types (SLA_BREACH, REFUND_DELAY_72_HOURS, REPEATED_CANCELLATIONS,
 * LOW_RATING_ALERT, PAYMENT_RECONCILIATION_FAILURE, DUPLICATE_TRANSACTION_DETECTED) had no subtypes
 * and are intentionally not seeded. Historical cases are not rewritten.
 *
 * Old subtype (CaseSubTypeConfig in riwayat-case-manager) -> new case_type, for traceability:
 *   LATE_DELIVERY           <- LATE_DELIVERY, LATE_ARRIVAL
 *   RIDER_NO_SHOW           <- NO_SHOW_PICKUP, RIDER_NO_SHOW
 *   ADDRESS_ISSUE           <- ADDRESS_ISSUE
 *   RIDER_HANDLING_ISSUE    <- MISHANDLED_FOOD, WRONG_DELIVERY_SEQUENCE
 *   DELIVERY_PERFORMANCE    <- REPEATED_LATE_DELIVERIES, DELIVERY_PARTNER_RELIABILITY, RIDER_CAPACITY_ROUTING
 *   MISSING_ITEM            <- MISSING_ITEM, PARTIAL_DELIVERY
 *   WRONG_DISH              <- WRONG_DISH_DELIVERED
 *   UNNOTIFIED_CANCELLATION <- UNNOTIFIED_CANCELLATION
 *   FREQUENT_CANCELLATIONS  <- FREQUENT_CUSTOMER_CANCELLATIONS
 *   COLD_FOOD               <- COLD_FOOD
 *   STALE_FOOD              <- STALE_FOOD, COLD_OR_STALE
 *   UNDER_OR_OVERCOOKED     <- UNDER_OR_OVERCOOKED
 *   WRONG_PORTION           <- WRONG_PORTION
 *   HYGIENE_ISSUE           <- HYGIENE_ISSUE
 *   QUALITY_CHECK_FAILURE   <- QUALITY_CHECK_FAILURE
 *   UNFAIR_RATING           <- UNFAIR_ONE_STAR, INACCURATE_COMMENT
 *   INAPPROPRIATE_COMMENT   <- INAPPROPRIATE_COMMENT
 *   REVIEW_NOT_VISIBLE      <- REVIEW_NOT_VISIBLE
 *   WRONG_FEEDBACK_ATTACHED <- WRONG_FEEDBACK_ATTACHED
 *   FEEDBACK_MANIPULATION   <- FEEDBACK_MANIPULATION, DISCOUNT_REQUEST_ABUSE
 *   REFUND_ISSUE            <- REFUND_NOT_RECEIVED
 *   CHARGE_ISSUE            <- PAYMENT_DEDUCTED_FAILED, DOUBLE_CHARGE, OVERCHARGED, DUPLICATE_PAYMENT
 *   VOUCHER_ISSUE           <- VOUCHER_ERROR
 *   SETTLEMENT_DELAY        <- SETTLEMENT_DELAYED
 *   SETTLEMENT_MISMATCH     <- WRONG_AMOUNT_CREDITED, REFUND_DEDUCTED, PAYOUT_MISMATCH
 *   REFUND_ESCALATION       <- REFUND_DELAYED, REFUND_OVER_UNDER, MANUAL_REFUND_PENDING
 *   RECONCILIATION_ISSUE    <- PAYMENT_MISMATCH, DUPLICATE_TRANSACTION, FAILED_PAYOUT_BATCH
 *   APP_NOT_WORKING         <- APP_CRASH, NOTIFICATION_FAILURE, NOTIFICATION_DELAY, DISH_MENU_UPDATE_FAILED
 *   ORDER_SYNC_ISSUE        <- ORDER_SYNC_ISSUE, ORDER_NOT_VISIBLE, KITCHEN_STATUS_NOT_SYNCED
 *   KITCHEN_SETTINGS_ISSUE  <- WRONG_DELIVERY_ZONES, APP_TIMINGS_MISMATCH
 *   RUDE_BEHAVIOR           <- RUDE_RIDER, RUDE_COMMUNICATION
 *   KITCHEN_NO_RESPONSE     <- KITCHEN_NO_RESPONSE
 *   SUPPORT_RESPONSE_DELAY  <- SUPPORT_RESPONSE_DELAY
 *   CUSTOMER_MISCONDUCT     <- FALSE_COMPLAINT, REPEATED_LATE_COD
 *   KITCHEN_PERFORMANCE     <- CONSISTENT_LOW_RATINGS, SLA_BREACH_PATTERN
 *   POLICY_VIOLATION        <- CONTENT_POLICY_VIOLATION, UNAUTHORIZED_BRANDING_USE, UNOFFICIAL_THIRD_PARTY_PARTNERSHIP, SHARING_CUSTOMER_DATA
 *   HYGIENE_VIOLATION       <- HYGIENE_VIOLATIONS, UNCLEAN_WORKSPACE, EXPIRED_INGREDIENTS, UNSAFE_PACKAGING_STORAGE
 *   MISREPRESENTATION       <- FAKE_FOOD_PHOTOS, MISLEADING_DISH_NAME, INCORRECT_ALLERGEN_INFO
 *   VERIFICATION_ISSUE      <- MISSING_CNIC_LICENSE, EXPIRED_VERIFICATION_DOCS, WRONG_ADDRESS_MISMATCH, UNVERIFIED_DUPLICATE_KITCHEN
 *   CUSTOMER_ABUSE          <- ABUSIVE_COMPLAINTS, REFUND_POLICY_MISUSE, FAKE_OR_DUPLICATE_ORDERS
 *
 * down() drops the table (with its constraints and trigger). That deletes every policy row, including any
 * edits made in production after the seed (changed priorities, SLAs, raisers, statuses, added rows); they
 * are NOT restored by running up() again, which only re-inserts the seed above. Back the table up first.
 * No case data lives in this table, so cases themselves are not affected.
 */

exports.up = (pgm) => {
  pgm.createTable('case_policy_rule', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    case_category: { type: 'varchar(100)', notNull: true },
    case_type: { type: 'varchar(100)', notNull: true },
    allowed_raisers: { type: 'jsonb', notNull: true, default: pgm.func(`'[]'::jsonb`) },
    allowed_subject_types: { type: 'jsonb', notNull: true, default: pgm.func(`'[]'::jsonb`) },
    priority: { type: 'varchar(20)', notNull: true, default: 'MEDIUM' },
    sla_hours: { type: 'integer', notNull: true, default: 24 },
    is_internal: { type: 'boolean', notNull: true, default: false },
    status: { type: 'varchar(20)', notNull: true, default: 'ACTIVE' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  }, { ifNotExists: true });

  // Named constraints, each added only if missing (pgm.addConstraint has no IF NOT EXISTS).
  pgm.sql(String.raw`
DO $constraints$
DECLARE
  defs text[][] := ARRAY[
    ['uq_case_policy_category_type', 'UNIQUE (case_category, case_type)'],
    ['chk_case_policy_priority',     $c$CHECK (priority IN ('LOW','MEDIUM','HIGH','CRITICAL'))$c$],
    ['chk_case_policy_sla',          'CHECK (sla_hours > 0)'],
    ['chk_case_policy_status',       $c$CHECK (status IN ('ACTIVE','INACTIVE'))$c$],
    ['chk_case_policy_raisers',      $c$CHECK (jsonb_typeof(allowed_raisers) = 'array')$c$],
    ['chk_case_policy_subjects',     $c$CHECK (jsonb_typeof(allowed_subject_types) = 'array')$c$]
  ];
  i int;
BEGIN
  FOR i IN 1 .. array_length(defs, 1) LOOP
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = 'case_policy_rule'::regclass AND conname = defs[i][1]) THEN
      EXECUTE format('ALTER TABLE case_policy_rule ADD CONSTRAINT %I %s', defs[i][1], defs[i][2]);
    END IF;
  END LOOP;
END
$constraints$;
`);

  pgm.sql(String.raw`
DO $trigger$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_case_policy_rule_updated_at' AND tgrelid = to_regclass('case_policy_rule')) THEN
CREATE TRIGGER trg_case_policy_rule_updated_at BEFORE UPDATE ON case_policy_rule FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;
END
$trigger$;
`);

  pgm.sql(String.raw`
INSERT INTO case_policy_rule (case_category, case_type, allowed_raisers, allowed_subject_types, priority, sla_hours, is_internal) VALUES
  ('DELIVERY',        'LATE_DELIVERY',           '["CUSTOMER","KITCHEN","TEAM"]', '["ORDER","DELIVERY"]',             'MEDIUM', 4,  false),
  ('DELIVERY',        'RIDER_NO_SHOW',           '["KITCHEN","TEAM"]',            '["ORDER","DELIVERY"]',             'HIGH',   2,  false),
  ('DELIVERY',        'ADDRESS_ISSUE',           '["CUSTOMER","TEAM"]',           '["ORDER","DELIVERY"]',             'MEDIUM', 12, false),
  ('DELIVERY',        'RIDER_HANDLING_ISSUE',    '["KITCHEN","TEAM"]',            '["ORDER","DELIVERY"]',             'MEDIUM', 24, false),
  ('DELIVERY',        'DELIVERY_PERFORMANCE',    '["TEAM"]',                      '["DELIVERY"]',                     'MEDIUM', 72, true),
  ('ORDER',           'MISSING_ITEM',            '["CUSTOMER","TEAM"]',           '["ORDER"]',                        'MEDIUM', 12, false),
  ('ORDER',           'WRONG_DISH',              '["CUSTOMER","TEAM"]',           '["ORDER"]',                        'MEDIUM', 12, false),
  ('ORDER',           'UNNOTIFIED_CANCELLATION', '["CUSTOMER","TEAM"]',           '["ORDER"]',                        'HIGH',   12, false),
  ('ORDER',           'FREQUENT_CANCELLATIONS',  '["KITCHEN","TEAM"]',            '["CUSTOMER","ORDER"]',             'MEDIUM', 72, false),
  ('FOOD_QUALITY',    'COLD_FOOD',               '["CUSTOMER","TEAM"]',           '["ORDER"]',                        'LOW',    24, false),
  ('FOOD_QUALITY',    'STALE_FOOD',              '["CUSTOMER","TEAM"]',           '["ORDER"]',                        'LOW',    24, false),
  ('FOOD_QUALITY',    'UNDER_OR_OVERCOOKED',     '["CUSTOMER","TEAM"]',           '["ORDER"]',                        'LOW',    24, false),
  ('FOOD_QUALITY',    'WRONG_PORTION',           '["CUSTOMER","TEAM"]',           '["ORDER"]',                        'MEDIUM', 24, false),
  ('FOOD_QUALITY',    'HYGIENE_ISSUE',           '["CUSTOMER","TEAM"]',           '["ORDER","KITCHEN"]',              'HIGH',   4,  false),
  ('FOOD_QUALITY',    'QUALITY_CHECK_FAILURE',   '["TEAM"]',                      '["KITCHEN"]',                      'HIGH',   24, true),
  ('FEEDBACK',        'UNFAIR_RATING',           '["KITCHEN","TEAM"]',            '["FEEDBACK"]',                     'MEDIUM', 24, false),
  ('FEEDBACK',        'INAPPROPRIATE_COMMENT',   '["CUSTOMER","KITCHEN","TEAM"]', '["FEEDBACK"]',                     'MEDIUM', 24, false),
  ('FEEDBACK',        'REVIEW_NOT_VISIBLE',      '["CUSTOMER","KITCHEN","TEAM"]', '["FEEDBACK"]',                     'LOW',    24, false),
  ('FEEDBACK',        'WRONG_FEEDBACK_ATTACHED', '["CUSTOMER","TEAM"]',           '["FEEDBACK"]',                     'MEDIUM', 24, false),
  ('FEEDBACK',        'FEEDBACK_MANIPULATION',   '["KITCHEN","TEAM"]',            '["FEEDBACK"]',                     'MEDIUM', 24, false),
  ('PAYMENT',         'REFUND_ISSUE',            '["CUSTOMER","TEAM"]',           '["ORDER","PAYMENT"]',              'MEDIUM', 24, false),
  ('PAYMENT',         'CHARGE_ISSUE',            '["CUSTOMER","TEAM"]',           '["ORDER","PAYMENT"]',              'HIGH',   12, false),
  ('PAYMENT',         'VOUCHER_ISSUE',           '["CUSTOMER","TEAM"]',           '["ORDER"]',                        'MEDIUM', 24, false),
  ('PAYMENT',         'SETTLEMENT_DELAY',        '["KITCHEN","TEAM"]',            '["PAYMENT"]',                      'HIGH',   24, false),
  ('PAYMENT',         'SETTLEMENT_MISMATCH',     '["KITCHEN","TEAM"]',            '["PAYMENT"]',                      'HIGH',   24, false),
  ('PAYMENT',         'REFUND_ESCALATION',       '["TEAM"]',                      '["ORDER","PAYMENT"]',              'MEDIUM', 72, true),
  ('PAYMENT',         'RECONCILIATION_ISSUE',    '["TEAM"]',                      '["PAYMENT"]',                      'HIGH',   24, true),
  ('ACCOUNT_AND_APP', 'APP_NOT_WORKING',         '["CUSTOMER","KITCHEN","TEAM"]', '["CUSTOMER","KITCHEN"]',           'MEDIUM', 12, false),
  ('ACCOUNT_AND_APP', 'ORDER_SYNC_ISSUE',        '["CUSTOMER","KITCHEN","TEAM"]', '["ORDER","KITCHEN"]',              'HIGH',   4,  false),
  ('ACCOUNT_AND_APP', 'KITCHEN_SETTINGS_ISSUE',  '["KITCHEN","TEAM"]',            '["KITCHEN"]',                      'MEDIUM', 24, false),
  ('SERVICE',         'RUDE_BEHAVIOR',           '["CUSTOMER","KITCHEN","TEAM"]', '["ORDER","DELIVERY","CUSTOMER"]',  'MEDIUM', 24, false),
  ('SERVICE',         'KITCHEN_NO_RESPONSE',     '["CUSTOMER","TEAM"]',           '["ORDER","KITCHEN"]',              'MEDIUM', 12, false),
  ('SERVICE',         'SUPPORT_RESPONSE_DELAY',  '["CUSTOMER","KITCHEN","TEAM"]', '["ORDER","CUSTOMER","KITCHEN"]',   'MEDIUM', 24, false),
  ('SERVICE',         'CUSTOMER_MISCONDUCT',     '["KITCHEN","TEAM"]',            '["CUSTOMER","ORDER"]',             'MEDIUM', 24, false),
  ('SERVICE',         'KITCHEN_PERFORMANCE',     '["TEAM"]',                      '["KITCHEN"]',                      'MEDIUM', 72, true),
  ('COMPLIANCE',      'POLICY_VIOLATION',        '["TEAM"]',                      '["KITCHEN","CUSTOMER"]',           'HIGH',   24, true),
  ('COMPLIANCE',      'HYGIENE_VIOLATION',       '["TEAM"]',                      '["KITCHEN"]',                      'HIGH',   24, true),
  ('COMPLIANCE',      'MISREPRESENTATION',       '["TEAM"]',                      '["KITCHEN"]',                      'HIGH',   24, true),
  ('COMPLIANCE',      'VERIFICATION_ISSUE',      '["TEAM"]',                      '["KITCHEN"]',                      'MEDIUM', 72, true),
  ('COMPLIANCE',      'CUSTOMER_ABUSE',          '["TEAM"]',                      '["CUSTOMER"]',                     'HIGH',   24, true)
ON CONFLICT (case_category, case_type) DO NOTHING;
`);
};

// Loses all policy edits made in production (see header).
exports.down = (pgm) => {
  pgm.dropTable('case_policy_rule', { ifExists: true });
};
