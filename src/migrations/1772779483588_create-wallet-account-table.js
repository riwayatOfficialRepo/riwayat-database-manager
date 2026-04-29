// No-op: some DBs recorded this name in pgmigrations before the file was reorganised.
// Actual table creation is in 1773500000001. Restored so checkOrder does not fail.
exports.up = (_pgm) => {};
exports.down = (_pgm) => {};
