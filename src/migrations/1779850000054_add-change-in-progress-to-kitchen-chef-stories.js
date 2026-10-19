exports.up = (pgm) => {
  pgm.sql(`ALTER TABLE kitchen_chef_stories ADD COLUMN IF NOT EXISTS change_in_progress BOOLEAN NOT NULL DEFAULT false`);
};

exports.down = (pgm) => {
  pgm.sql(`ALTER TABLE kitchen_chef_stories DROP COLUMN IF EXISTS change_in_progress`);
};
