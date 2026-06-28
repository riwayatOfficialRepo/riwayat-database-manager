exports.up = (pgm) => {
  pgm.sql(`ALTER TABLE change_requests ADD COLUMN IF NOT EXISTS kitchen_id UUID`);
};

exports.down = (pgm) => {
  pgm.sql(`ALTER TABLE change_requests DROP COLUMN IF EXISTS kitchen_id`);
};
