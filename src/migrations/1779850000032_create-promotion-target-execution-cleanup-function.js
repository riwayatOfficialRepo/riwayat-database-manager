exports.up = (pgm) => {
  pgm.sql(`
    CREATE OR REPLACE FUNCTION execute_promotion_target_cleanup(p_promotion_target_id UUID)
    RETURNS void AS $$
    BEGIN

      -- Step 1: Remove dishes that have no approved variants
      -- (CASCADE will remove their variant children too)
      DELETE FROM promotion_target_dishes
      WHERE promotion_target_kitchen_id IN (
        SELECT id FROM promotion_target_kitchens
        WHERE promotion_target_id = p_promotion_target_id
      )
      AND operational_status = 'APPROVED'
      AND id NOT IN (
        SELECT DISTINCT promotion_target_dish_id
        FROM promotion_target_variants
        WHERE operational_status = 'APPROVED'
      );

      -- Step 2: Remove kitchens that have no approved dish with an approved variant
      -- (CASCADE will remove their dish and variant children too)
      DELETE FROM promotion_target_kitchens
      WHERE promotion_target_id = p_promotion_target_id
      AND id NOT IN (
        SELECT DISTINCT ptd.promotion_target_kitchen_id
        FROM promotion_target_dishes ptd
        JOIN promotion_target_variants ptv
          ON ptv.promotion_target_dish_id = ptd.id
        WHERE ptd.operational_status = 'APPROVED'
          AND ptv.operational_status = 'APPROVED'
      );

    END;
    $$ LANGUAGE plpgsql;
  `);
};

exports.down = (pgm) => {
  pgm.sql(`DROP FUNCTION IF EXISTS execute_promotion_target_cleanup(UUID)`);
};
