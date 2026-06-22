exports.up = (pgm) => {
  pgm.sql(`ALTER TABLE kitchen_user_docs ADD COLUMN IF NOT EXISTS change_in_progress BOOLEAN NOT NULL DEFAULT false`);
};

exports.down = (pgm) => {
  pgm.sql(`ALTER TABLE kitchen_user_docs DROP COLUMN IF EXISTS change_in_progress`);
};
