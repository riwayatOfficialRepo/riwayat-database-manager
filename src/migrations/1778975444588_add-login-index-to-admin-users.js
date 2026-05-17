exports.up = (pgm) => {
  // admin_users_email_key (unique, non-partial) already exists from the create-table
  // migration and handles uniqueness enforcement.
  //
  // This partial index targets the login hot path:
  //   WHERE email = $1 AND deleted_at IS NULL
  //
  // Benefits over the full unique index:
  //   - Smaller: only indexes non-deleted rows
  //   - Planner prefers it when the query includes `deleted_at IS NULL`
  //   - Zero impact on uniqueness (admin_users_email_key still enforces that)
  pgm.sql(`
    CREATE INDEX IF NOT EXISTS admin_users_email_active_idx
      ON admin_users (email)
      WHERE deleted_at IS NULL
  `);
};

exports.down = (pgm) => {
  pgm.sql(`DROP INDEX IF EXISTS admin_users_email_active_idx`);
};
