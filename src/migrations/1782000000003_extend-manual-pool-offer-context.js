/**
 * Migration: allow the manual-pool offer context (Phase 3).
 *
 * Manual pool offers (a company user offering a pooled ride to a chosen rider)
 * create dl_delivery_offer rows with offer_context = 'MANUAL_POOL'. Extend the
 * existing CHECK to permit it alongside the auto-dispatch contexts.
 */
exports.up = (pgm) => {
  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE dl_delivery_offer DROP CONSTRAINT IF EXISTS dl_delivery_offer_context_check;
      ALTER TABLE dl_delivery_offer ADD CONSTRAINT dl_delivery_offer_context_check
        CHECK (offer_context IS NULL OR offer_context IN ('EXISTING_RIDE','NEW_RIDE','MANUAL_POOL'));
    END $$;
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE dl_delivery_offer DROP CONSTRAINT IF EXISTS dl_delivery_offer_context_check;
      ALTER TABLE dl_delivery_offer ADD CONSTRAINT dl_delivery_offer_context_check
        CHECK (offer_context IS NULL OR offer_context IN ('EXISTING_RIDE','NEW_RIDE'));
    END $$;
  `);
};
