/**
 * Promotion domain: one live child row per parent, enforced in the database.
 *
 * Partial unique indexes (WHERE deleted_at IS NULL), so a soft-deleted row never blocks a new one:
 *   promotions_staging(promotion_id), promotion_eligibility(promotion_id),
 *   promotion_eligibility_staging(promotion_eligibility_id), promotion_audience_rules(promotion_id),
 *   promotion_audience_rules_staging(audience_rule_id), promotion_codes(promotion_id),
 *   promotion_codes_staging(promotion_code_id), promotion_targets(promotion_id),
 *   promotion_target_kitchens(promotion_target_id, kitchen_id), promotion_target_dishes(promotion_target_kitchen_id, dish_id),
 *   promotion_target_variants(promotion_target_dish_id, variant_id).
 * The existing non-unique lookup indexes are kept.
 *
 * down() drops these indexes.
 */

// [table, columns, index name]
const INDEXES = [
  ['promotions_staging', ['promotion_id'], 'idx_promotions_staging_promotion_unique'],
  ['promotion_eligibility', ['promotion_id'], 'idx_promotion_eligibility_promotion_unique'],
  ['promotion_eligibility_staging', ['promotion_eligibility_id'], 'idx_promotion_eligibility_staging_eligibility_unique'],
  ['promotion_audience_rules', ['promotion_id'], 'idx_promotion_audience_rules_promotion_unique'],
  ['promotion_audience_rules_staging', ['audience_rule_id'], 'idx_promotion_audience_rules_staging_rule_unique'],
  ['promotion_codes', ['promotion_id'], 'idx_promotion_codes_promotion_unique'],
  ['promotion_codes_staging', ['promotion_code_id'], 'idx_promotion_codes_staging_code_unique'],
  ['promotion_targets', ['promotion_id'], 'idx_promotion_targets_promotion_unique'],
  ['promotion_target_kitchens', ['promotion_target_id', 'kitchen_id'], 'idx_promotion_target_kitchens_target_kitchen_unique'],
  ['promotion_target_dishes', ['promotion_target_kitchen_id', 'dish_id'], 'idx_promotion_target_dishes_kitchen_dish_unique'],
  ['promotion_target_variants', ['promotion_target_dish_id', 'variant_id'], 'idx_promotion_target_variants_dish_variant_unique'],
];

exports.up = (pgm) => {
  for (const [table, columns, name] of INDEXES) {
    pgm.createIndex(table, columns, {
      name,
      unique: true,
      where: 'deleted_at IS NULL',
      ifNotExists: true,
    });
  }
};

exports.down = (pgm) => {
  for (const [table, , name] of INDEXES) {
    pgm.dropIndex(table, [], { name, ifExists: true });
  }
};
