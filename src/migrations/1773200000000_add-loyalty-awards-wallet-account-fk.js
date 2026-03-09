/**
 * Adds FK from loyalty_awards.wallet_account_id -> wallet_accounts.wallet_account_id
 * Separated into this late migration because loyalty_awards (1772778975888)
 * sorts before wallet_accounts (1772779483588) so the FK can only be added after both tables exist.
 */

// No-op: wallet_accounts is not guaranteed to exist at this timestamp on all DBs.
// The FK is added in 1773500000003 (after wallet_accounts is created in 1773500000001).
exports.up = (_pgm) => {};
exports.down = (_pgm) => {};
