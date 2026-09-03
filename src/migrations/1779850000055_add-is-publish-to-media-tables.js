exports.up = (pgm) => {
  pgm.sql(`ALTER TABLE kitchen_media ADD COLUMN IF NOT EXISTS is_publish BOOLEAN NOT NULL DEFAULT false`);
  pgm.sql(`ALTER TABLE dish_media    ADD COLUMN IF NOT EXISTS is_publish BOOLEAN NOT NULL DEFAULT false`);
};

exports.down = (pgm) => {
  pgm.sql(`ALTER TABLE kitchen_media DROP COLUMN IF EXISTS is_publish`);
  pgm.sql(`ALTER TABLE dish_media    DROP COLUMN IF EXISTS is_publish`);
};
