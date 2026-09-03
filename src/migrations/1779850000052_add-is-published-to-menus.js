exports.up = (pgm) => {
  pgm.sql(`ALTER TABLE menus ADD COLUMN IF NOT EXISTS is_published BOOLEAN NOT NULL DEFAULT false`);
  pgm.sql(`ALTER TABLE menus ADD COLUMN IF NOT EXISTS status       VARCHAR(50)`);
};

exports.down = (pgm) => {
  pgm.sql(`ALTER TABLE menus DROP COLUMN IF EXISTS is_published`);
  pgm.sql(`ALTER TABLE menus DROP COLUMN IF EXISTS status`);
};
