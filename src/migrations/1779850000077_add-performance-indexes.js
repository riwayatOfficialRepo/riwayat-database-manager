/**
 * Performance indexes for hot query paths across all core modules.
 *
 * Partial indexes (WHERE deleted_at IS NULL) exclude soft-deleted rows —
 * Postgres only scans live rows, keeping index size small and scans fast.
 */

exports.up = (pgm) => {
  // ─── kitchens ─────────────────────────────────────────────────────────────
  pgm.createIndex('kitchens', ['status'], {
    name: 'idx_kitchens_status',
    where: 'deleted_at IS NULL',
    ifNotExists: true,
  });
  pgm.createIndex('kitchens', ['operational_status'], {
    name: 'idx_kitchens_operational_status',
    where: 'deleted_at IS NULL',
    ifNotExists: true,
  });
  pgm.createIndex('kitchens', ['created_at'], {
    name: 'idx_kitchens_created_at',
    where: 'deleted_at IS NULL',
    ifNotExists: true,
  });

  // ─── kitchen_users ────────────────────────────────────────────────────────
  // phone/status already indexed in migration 003; only kitchen_id is missing
  pgm.createIndex('kitchen_users', ['kitchen_id'], {
    name: 'idx_kitchen_users_kitchen_id',
    ifNotExists: true,
  });

  // ─── kitchen_user_invitations ─────────────────────────────────────────────
  pgm.createIndex('kitchen_user_invitations', ['kitchen_id'], {
    name: 'idx_kui_kitchen_id',
    where: 'deleted_at IS NULL',
    ifNotExists: true,
  });
  pgm.createIndex('kitchen_user_invitations', ['phone', 'kitchen_id', 'status'], {
    name: 'idx_kui_phone_kitchen_status',
    where: 'deleted_at IS NULL',
    ifNotExists: true,
  });
  pgm.createIndex('kitchen_user_invitations', ['email', 'kitchen_id'], {
    name: 'idx_kui_email_kitchen',
    where: 'deleted_at IS NULL AND email IS NOT NULL',
    ifNotExists: true,
  });
  pgm.createIndex('kitchen_user_invitations', ['invitation_code'], {
    name: 'idx_kui_invitation_code',
    where: 'deleted_at IS NULL',
    ifNotExists: true,
  });

  // ─── dishes ───────────────────────────────────────────────────────────────
  pgm.createIndex('dishes', ['kitchen_id'], {
    name: 'idx_dishes_kitchen_id',
    where: 'deleted_at IS NULL',
    ifNotExists: true,
  });
  pgm.createIndex('dishes', ['kitchen_id', 'status'], {
    name: 'idx_dishes_kitchen_id_status',
    where: 'deleted_at IS NULL',
    ifNotExists: true,
  });
  pgm.createIndex('dishes', ['dish_category_id'], {
    name: 'idx_dishes_category_id',
    where: 'deleted_at IS NULL',
    ifNotExists: true,
  });
  pgm.createIndex('dishes', ['created_at'], {
    name: 'idx_dishes_created_at',
    where: 'deleted_at IS NULL',
    ifNotExists: true,
  });

  // ─── dishes_staging ───────────────────────────────────────────────────────
  pgm.createIndex('dishes_staging', ['dish_id'], {
    name: 'idx_dishes_staging_dish_id',
    ifNotExists: true,
  });

  // ─── dish_variants ────────────────────────────────────────────────────────
  pgm.createIndex('dish_variants', ['dish_id'], {
    name: 'idx_dish_variants_dish_id',
    where: 'deleted_at IS NULL',
    ifNotExists: true,
  });

  // ─── dish_variant_items ───────────────────────────────────────────────────
  pgm.createIndex('dish_variant_items', ['variant_id'], {
    name: 'idx_dish_variant_items_variant_id',
    ifNotExists: true,
  });

  // ─── feedbacks ────────────────────────────────────────────────────────────
  pgm.createIndex('feedbacks', ['kitchen_id'], {
    name: 'idx_feedbacks_kitchen_id',
    where: 'deleted_at IS NULL',
    ifNotExists: true,
  });
  pgm.createIndex('feedbacks', ['kitchen_id', 'status'], {
    name: 'idx_feedbacks_kitchen_id_status',
    where: 'deleted_at IS NULL',
    ifNotExists: true,
  });
  pgm.createIndex('feedbacks', ['customer_id'], {
    name: 'idx_feedbacks_customer_id',
    where: 'deleted_at IS NULL',
    ifNotExists: true,
  });
  // Used by the auto-publish cron job
  pgm.createIndex('feedbacks', ['status', 'to_be_published_date'], {
    name: 'idx_feedbacks_status_publish_date',
    where: "deleted_at IS NULL AND status IN ('PENDING_AT_KITCHEN', 'RESPONDED_BY_KITCHEN')",
    ifNotExists: true,
  });

  // ─── menus ────────────────────────────────────────────────────────────────
  pgm.createIndex('menus', ['kitchen_id', 'display_order'], {
    name: 'idx_menus_kitchen_id_display_order',
    where: 'deleted_at IS NULL',
    ifNotExists: true,
  });

  // ─── variant_inventory_daily ──────────────────────────────────────────────
  pgm.createIndex('variant_inventory_daily', ['dish_variant_id', 'inventory_date'], {
    name: 'idx_vid_variant_date',
    ifNotExists: true,
  });
  pgm.createIndex('variant_inventory_daily', ['kitchen_id', 'inventory_date'], {
    name: 'idx_vid_kitchen_date',
    ifNotExists: true,
  });

  // ─── promotion_targets ────────────────────────────────────────────────────
  pgm.createIndex('promotion_targets', ['promotion_id'], {
    name: 'idx_promotion_targets_promotion_id',
    where: 'deleted_at IS NULL',
    ifNotExists: true,
  });

  // ─── promotion_target_kitchens ────────────────────────────────────────────
  pgm.createIndex('promotion_target_kitchens', ['promotion_target_id', 'kitchen_id'], {
    name: 'idx_ptk_target_kitchen',
    where: 'deleted_at IS NULL',
    ifNotExists: true,
  });

  // ─── promotion_target_dishes ──────────────────────────────────────────────
  pgm.createIndex('promotion_target_dishes', ['promotion_target_kitchen_id', 'dish_id'], {
    name: 'idx_ptd_kitchen_dish',
    where: 'deleted_at IS NULL',
    ifNotExists: true,
  });

  // ─── promotion_target_variants ────────────────────────────────────────────
  pgm.createIndex('promotion_target_variants', ['promotion_target_dish_id'], {
    name: 'idx_ptv_dish',
    where: 'deleted_at IS NULL',
    ifNotExists: true,
  });

  // ─── change_requests ──────────────────────────────────────────────────────
  // kitchen_id + status — most common: "show pending requests for this kitchen"
  pgm.createIndex('change_requests', ['kitchen_id', 'status'], {
    name: 'idx_change_requests_kitchen_status',
    ifNotExists: true,
  });
  // entity lookup — find requests for a specific entity (dish, variant, etc.)
  pgm.createIndex('change_requests', ['entity_id', 'entity_name'], {
    name: 'idx_change_requests_entity',
    ifNotExists: true,
  });
  // workflow + status — approve/reject flows filter by workflow type and pending status
  pgm.createIndex('change_requests', ['workflow_id', 'status'], {
    name: 'idx_change_requests_workflow_status',
    ifNotExists: true,
  });
  // requested_by — "requests I submitted"
  pgm.createIndex('change_requests', ['requested_by'], {
    name: 'idx_change_requests_requested_by',
    ifNotExists: true,
  });
  // created_at — default ORDER BY
  pgm.createIndex('change_requests', ['created_at'], {
    name: 'idx_change_requests_created_at',
    ifNotExists: true,
  });
};

exports.down = (pgm) => {
  const indexes = [
    'idx_kitchens_status',
    'idx_kitchens_operational_status',
    'idx_kitchens_created_at',
    'idx_kitchen_users_kitchen_id',
    'idx_kui_kitchen_id',
    'idx_kui_phone_kitchen_status',
    'idx_kui_email_kitchen',
    'idx_kui_invitation_code',
    'idx_dishes_kitchen_id',
    'idx_dishes_kitchen_id_status',
    'idx_dishes_category_id',
    'idx_dishes_created_at',
    'idx_dishes_staging_dish_id',
    'idx_dish_variants_dish_id',
    'idx_dish_variant_items_variant_id',
    'idx_feedbacks_kitchen_id',
    'idx_feedbacks_kitchen_id_status',
    'idx_feedbacks_customer_id',
    'idx_feedbacks_status_publish_date',
    'idx_menus_kitchen_id_display_order',
    'idx_vid_variant_date',
    'idx_vid_kitchen_date',
    'idx_promotion_targets_promotion_id',
    'idx_ptk_target_kitchen',
    'idx_ptd_kitchen_dish',
    'idx_ptv_dish',
    'idx_change_requests_kitchen_status',
    'idx_change_requests_entity',
    'idx_change_requests_workflow_status',
    'idx_change_requests_requested_by',
    'idx_change_requests_created_at',
  ];

  for (const name of indexes) {
    pgm.dropIndex([], [], { name, ifExists: true });
  }
};
