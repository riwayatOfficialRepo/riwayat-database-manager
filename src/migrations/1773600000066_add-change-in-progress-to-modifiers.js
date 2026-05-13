exports.up = (pgm) => {
  pgm.sql(`ALTER TABLE modifiers ADD COLUMN IF NOT EXISTS change_in_progress boolean NOT NULL DEFAULT false`);
  pgm.sql(`ALTER TABLE modifiers_staging ADD COLUMN IF NOT EXISTS change_in_progress boolean NOT NULL DEFAULT false`);
};

exports.down = (pgm) => {
  pgm.sql(`ALTER TABLE modifiers DROP COLUMN IF EXISTS change_in_progress`);
  pgm.sql(`ALTER TABLE modifiers_staging DROP COLUMN IF EXISTS change_in_progress`);
};
