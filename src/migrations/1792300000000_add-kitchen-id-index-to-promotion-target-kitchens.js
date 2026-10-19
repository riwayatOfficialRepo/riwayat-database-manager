// Reverse lookup "promotions targeting this kitchen" filters on kitchen_id alone —
// idx_ptk_target_kitchen leads with promotion_target_id, so it can't serve that query.
exports.up = (pgm) => {
  pgm.createIndex('promotion_target_kitchens', ['kitchen_id'], {
    name: 'idx_ptk_kitchen_id',
    where: 'deleted_at IS NULL',
    ifNotExists: true,
  });
};

exports.down = (pgm) => {
  pgm.dropIndex('promotion_target_kitchens', [], { name: 'idx_ptk_kitchen_id', ifExists: true });
};
