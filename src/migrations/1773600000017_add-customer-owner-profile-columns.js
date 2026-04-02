/**
 * Owner onboarding fields for customer app (PATCH /auth/owner).
 * Base customer table had dob/gender but not bio or primary-owner metadata.
 */

exports.up = (pgm) => {
  pgm.addColumn("customer", {
    bio: {
      type: "text",
    },
    relation_to_primary_owner: {
      type: "text",
    },
    is_primary_owner: {
      type: "boolean",
      notNull: true,
      default: false,
    },
  });
};

exports.down = (pgm) => {
  pgm.dropColumn("customer", "bio", { ifExists: true });
  pgm.dropColumn("customer", "relation_to_primary_owner", { ifExists: true });
  pgm.dropColumn("customer", "is_primary_owner", { ifExists: true });
};
