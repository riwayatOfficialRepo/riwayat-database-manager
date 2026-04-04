/**
 * Trial/timeout columns for customer forgot-PIN OTP (otp_type: forgot_pin).
 * node-pg-migrate v8: addColumn(table, { columnName: def }) — not (table, name, def).
 */

exports.up = (pgm) => {
  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE otp_requests
        ADD COLUMN IF NOT EXISTS forgot_pin_trial_count integer NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS timeout_until_forgot_pin timestamp;
    EXCEPTION WHEN undefined_table THEN
      NULL;
    END $$;
  `);
};

exports.down = (pgm) => {
  pgm.dropColumn("otp_requests", "forgot_pin_trial_count", { ifExists: true });
  pgm.dropColumn("otp_requests", "timeout_until_forgot_pin", { ifExists: true });
};
