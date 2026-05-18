exports.up = (pgm) => {
  // Hot path: active user status lookups (WHERE deleted_at IS NULL)
  pgm.sql(`CREATE INDEX IF NOT EXISTS idx_admin_users_active_status ON admin_users (status) WHERE deleted_at IS NULL`);
  // Full scan fallback for admin/audit views
  pgm.sql(`CREATE INDEX IF NOT EXISTS idx_admin_users_deleted_at ON admin_users (deleted_at)`);
};

exports.down = (pgm) => {
  pgm.sql(`DROP INDEX IF EXISTS idx_admin_users_active_status`);
  pgm.sql(`DROP INDEX IF EXISTS idx_admin_users_deleted_at`);
};
