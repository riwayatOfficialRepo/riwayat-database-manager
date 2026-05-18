exports.up = (pgm) => {
  pgm.sql(`CREATE INDEX IF NOT EXISTS idx_kitchens_active_created_at ON kitchens (created_at DESC) WHERE deleted_at IS NULL`);
  pgm.sql(`CREATE INDEX IF NOT EXISTS idx_kitchens_created_at ON kitchens (created_at DESC)`);
};

exports.down = (pgm) => {
  pgm.sql(`DROP INDEX IF EXISTS idx_kitchens_active_created_at`);
  pgm.sql(`DROP INDEX IF EXISTS idx_kitchens_created_at`);
};
