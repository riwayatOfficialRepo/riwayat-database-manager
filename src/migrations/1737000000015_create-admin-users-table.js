// No-op stub: some DBs recorded this name in pgmigrations (admin_users was
// originally at timestamp 15, later moved to 1737000000049). Actual table
// creation is in 1737000000049_create-admin-users-table.js.
exports.up = (_pgm) => {};
exports.down = (_pgm) => {};
