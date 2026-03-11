/**
 * Add deleted_at column to customer table for soft deletes.
 */
exports.up = (pgm) => {
  pgm.addColumn("customer", {
    deleted_at: {
      type: "timestamp",
      notNull: false,
    },
  });

  // Optional index to speed up "active customers" queries
  pgm.createIndex("customer", "deleted_at", {
    name: "idx_customer_deleted_at",
    ifNotExists: true,
  });
};

exports.down = (pgm) => {
  pgm.dropIndex("customer", "deleted_at", {
    name: "idx_customer_deleted_at",
    ifExists: true,
  });

  pgm.dropColumn("customer", "deleted_at", {
    ifExists: true,
  });
};

