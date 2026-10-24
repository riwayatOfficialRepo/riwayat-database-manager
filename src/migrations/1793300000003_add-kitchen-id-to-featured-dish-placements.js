/**
 * Featured Dishes — the dish's kitchen on the placement.
 *
 * Every featured placement table now has kitchen_id: the kitchen is locked with the dish,
 * history can be searched by kitchen reference and results enriched with kitchen details.
 * Existing rows take the kitchen of their dish.
 */
exports.up = (pgm) => {
  pgm.addColumn('featured_dish_placements', {
    kitchen_id: { type: 'uuid', references: 'kitchens', onDelete: 'RESTRICT' },
  }, { ifNotExists: true });
  pgm.sql(`
    UPDATE featured_dish_placements fdp SET kitchen_id = d.kitchen_id
    FROM dishes d WHERE d.id = fdp.dish_id
  `);
  pgm.alterColumn('featured_dish_placements', 'kitchen_id', { notNull: true });

  pgm.createIndex('featured_dish_placements', 'kitchen_id', { ifNotExists: true });
};

exports.down = (pgm) => {
  pgm.dropColumn('featured_dish_placements', 'kitchen_id', { ifExists: true });
};
