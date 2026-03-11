exports.up = (pgm) => {
  // Ensure UUID extension exists (same pattern as admin_users)
  pgm.sql('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

  pgm.createTable(
    "refresh_tokens",
    {
      id: {
        type: "uuid",
        primaryKey: true,
        default: pgm.func("uuid_generate_v4()"),
      },
      user_id: {
        type: "uuid",
        notNull: true,
      },
      // This will be a no-op for existing DBs where the SQL migration already ran
      user_type: {
        type: "varchar(50)",
        notNull: true,
        default: "PARTNER",
      },
      token_hash: {
        type: "text",
        notNull: true,
      },
      revoked: {
        type: "boolean",
        notNull: true,
        default: false,
      },
      expires_at: {
        type: "timestamp",
        notNull: true,
      },
      created_at: {
        type: "timestamp",
        notNull: true,
        default: pgm.func("now()"),
      },
      updated_at: {
        type: "timestamp",
        notNull: true,
        default: pgm.func("now()"),
      },
    },
    { ifNotExists: true },
  );

  // Indexes for common access patterns in AuthService
  pgm.createIndex("refresh_tokens", "user_id", {
    name: "idx_refresh_tokens_user_id",
    ifNotExists: true,
  });

  pgm.createIndex("refresh_tokens", "token_hash", {
    name: "idx_refresh_tokens_token_hash",
    ifNotExists: true,
  });

  pgm.createIndex("refresh_tokens", ["user_id", "token_hash"], {
    name: "idx_refresh_tokens_user_id_token_hash",
    ifNotExists: true,
  });

  pgm.createIndex("refresh_tokens", "expires_at", {
    name: "idx_refresh_tokens_expires_at",
    ifNotExists: true,
  });
};

exports.down = (pgm) => {
  pgm.dropIndex("refresh_tokens", "expires_at", {
    name: "idx_refresh_tokens_expires_at",
    ifExists: true,
  });
  pgm.dropIndex("refresh_tokens", ["user_id", "token_hash"], {
    name: "idx_refresh_tokens_user_id_token_hash",
    ifExists: true,
  });
  pgm.dropIndex("refresh_tokens", "token_hash", {
    name: "idx_refresh_tokens_token_hash",
    ifExists: true,
  });
  pgm.dropIndex("refresh_tokens", "user_id", {
    name: "idx_refresh_tokens_user_id",
    ifExists: true,
  });
  pgm.dropTable("refresh_tokens", { ifExists: true });
};
