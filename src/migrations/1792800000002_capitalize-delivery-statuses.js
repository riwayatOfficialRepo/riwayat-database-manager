/**
 * Delivery domain (dl_*): statuses in capitals, as on the rest of the platform.
 *
 * Every status-like column is uppercased (existing rows and the column default):
 *   status of every dl_* table that has one, dl_ride.current_status / assignment_type,
 *   dl_rider_presence.availability_status, dl_rider_cod_wallet.risk_level.
 * Renames: dl_ride.status 'started' -> 'IN_PROGRESS'; dl_ride.assignment_type 'auto_dispatch' -> 'AUTO_ASSIGNED'.
 * dl_delivery_offer.offer_context is uppercased too (no default). Production has the legacy values 'ride' and
 * 'standalone' from before NEW_RIDE / EXISTING_RIDE / MANUAL_POOL; they become RIDE / STANDALONE and stay allowed
 * by the CHECK so those offers can still be updated (e.g. expired by the sweep).
 * CHECKs on the dispatch tables (ride, delivery, offers) are added NOT VALID and then validated: PostgreSQL checks a
 * NOT VALID constraint on every UPDATE, so an existing row outside the list would otherwise be frozen. Validation
 * stops the migration instead, naming the constraint, before anything is committed.
 *
 * down() lowercases the same columns and defaults and drops the CHECKs (the two renames are not undone).
 */

// [table, column, default (capitals)]
const COLUMNS = [
  ['dl_company', 'status', 'DRAFT'],
  ['dl_company_user', 'status', 'INVITED'],
  ['dl_company_user_role_mappings', 'status', 'ACTIVE'],
  ['dl_company_roles', 'status', 'ACTIVE'],
  ['dl_company_user_permissions', 'status', 'ACTIVE'],
  ['dl_company_document', 'status', 'PENDING'],
  ['dl_company_finance_transaction', 'status', 'PENDING_VERIFICATION'],
  ['dl_cod_receipt', 'status', 'PENDING_VERIFICATION'],
  ['dl_rider', 'status', 'PENDING'],
  ['dl_rider_presence', 'availability_status', 'OFFLINE'],
  ['dl_rider_cod_wallet', 'risk_level', 'LOW'],
  ['dl_rider_vehicle', 'status', 'PENDING'],
  ['dl_rider_document', 'status', 'PENDING'],
  ['dl_rider_media', 'status', 'UNDER_PROCESSING'],
  ['dl_media', 'status', 'UNDER_PROCESSING'],
  ['dl_rider_security_deposit', 'status', 'PENDING'],
  ['dl_ride', 'status', 'OPEN'],
  ['dl_ride', 'current_status', 'OFFERED'],
  ['dl_ride', 'assignment_type', 'AUTO_ASSIGNED'],
  ['dl_delivery', 'status', 'CREATED'],
  ['dl_ride_offer', 'status', 'PENDING'],
  ['dl_delivery_offer', 'status', 'PENDING'],
  ['dl_ride_payout', 'status', 'PENDING'],
  ['dl_delivery_payout', 'status', 'PENDING'],
];

const CHECKS = [
  ['dl_ride', 'dl_ride_status_check', `status IN ('OPEN', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')`],
  ['dl_ride', 'dl_ride_assignment_type_check', `assignment_type IN ('AUTO_ASSIGNED', 'MANUAL')`],
  ['dl_delivery', 'dl_delivery_status_check',
    `status IN ('CREATED', 'OFFERABLE', 'ASSIGNED', 'ARRIVED_PICKUP', 'PICKED_UP', 'ARRIVED_DROPOFF', 'DELIVERED', 'FAILED', 'CANCELLED')`],
  ['dl_ride_offer', 'dl_ride_offer_status_check', `status IN ('PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED')`],
  ['dl_delivery_offer', 'dl_delivery_offer_status_check', `status IN ('PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED')`],
  ['dl_delivery_offer', 'dl_delivery_offer_context_check',
    `offer_context IS NULL OR offer_context IN ('EXISTING_RIDE', 'NEW_RIDE', 'MANUAL_POOL', 'RIDE', 'STANDALONE')`],
];

// A table may be missing on a database built before the production schema sync: skip it there.
const guarded = (table, sql) => `
  DO $$ BEGIN
    IF to_regclass('public.${table}') IS NOT NULL THEN
      ${sql}
    END IF;
  END $$;`;

exports.up = (pgm) => {
  pgm.sql(guarded('dl_ride', `
      UPDATE public.dl_ride SET status = 'IN_PROGRESS' WHERE lower(status) = 'started';
      UPDATE public.dl_ride SET assignment_type = 'AUTO_ASSIGNED' WHERE lower(assignment_type) = 'auto_dispatch';`));
  for (const [table, column, def] of COLUMNS) {
    pgm.sql(guarded(table, `
      UPDATE public.${table} SET ${column} = upper(${column}) WHERE ${column} <> upper(${column});
      ALTER TABLE public.${table} ALTER COLUMN ${column} SET DEFAULT '${def}';`));
  }
  pgm.sql(guarded('dl_delivery_offer', `
      UPDATE public.dl_delivery_offer SET offer_context = upper(offer_context) WHERE offer_context <> upper(offer_context);`));
  for (const [table, name, check] of CHECKS) {
    pgm.sql(guarded(table, `
      ALTER TABLE public.${table} DROP CONSTRAINT IF EXISTS ${name};
      ALTER TABLE public.${table} ADD CONSTRAINT ${name} CHECK (${check}) NOT VALID;
      ALTER TABLE public.${table} VALIDATE CONSTRAINT ${name};`));
  }
};

exports.down = (pgm) => {
  for (const [table, name] of CHECKS) {
    pgm.sql(guarded(table, `ALTER TABLE public.${table} DROP CONSTRAINT IF EXISTS ${name};`));
  }
  for (const [table, column, def] of COLUMNS) {
    pgm.sql(guarded(table, `
      UPDATE public.${table} SET ${column} = lower(${column}) WHERE ${column} <> lower(${column});
      ALTER TABLE public.${table} ALTER COLUMN ${column} SET DEFAULT '${def.toLowerCase()}';`));
  }
};
