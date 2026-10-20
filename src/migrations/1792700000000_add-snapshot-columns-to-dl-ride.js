/**
 * dl_ride: kitchen_details, company_details, pickup_address (jsonb).
 *
 * riwayat-delivery-management-module's RideModel has had these columns since July (snapshots of the pickup kitchen,
 * the delivery company and the pickup address, as dl_delivery already keeps them), but production's dl_ride does
 * not. Same type as on dl_delivery; nullable, no default: existing rides have no snapshot.
 *
 * Guarded: does nothing where dl_ride does not exist yet (a fresh database before the production schema sync) or
 * already has the columns. down() removes only these three columns.
 */

const COLUMNS = ['kitchen_details', 'company_details', 'pickup_address'];

exports.up = (pgm) => {
  pgm.sql(`
    DO $$
    BEGIN
      IF to_regclass('public.dl_ride') IS NOT NULL THEN
        ${COLUMNS.map((c) => `ALTER TABLE public.dl_ride ADD COLUMN IF NOT EXISTS ${c} jsonb;`).join('\n        ')}
      END IF;
    END $$;
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    DO $$
    BEGIN
      IF to_regclass('public.dl_ride') IS NOT NULL THEN
        ${COLUMNS.map((c) => `ALTER TABLE public.dl_ride DROP COLUMN IF EXISTS ${c};`).join('\n        ')}
      END IF;
    END $$;
  `);
};
