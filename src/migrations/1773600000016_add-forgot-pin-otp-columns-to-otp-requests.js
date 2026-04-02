/**
 * Trial/timeout columns for customer forgot-PIN OTP (otp_type: forgot_pin).
 * node-pg-migrate v8: addColumn(table, { columnName: def }) — not (table, name, def).
 */

exports.up = (pgm) => {
  pgm.addColumn("otp_requests", {
    forgot_pin_trial_count: {
      type: "integer",
      notNull: true,
      default: 0,
    },
    timeout_until_forgot_pin: {
      type: "timestamp",
    },
  });
};

exports.down = (pgm) => {
  pgm.dropColumn("otp_requests", "forgot_pin_trial_count", { ifExists: true });
  pgm.dropColumn("otp_requests", "timeout_until_forgot_pin", { ifExists: true });
};
