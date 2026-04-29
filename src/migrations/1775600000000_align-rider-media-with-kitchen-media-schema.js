exports.up = (pgm) => {
  // Rename PK column to match kitchen_media shape.
  pgm.sql(`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'rider_media' AND column_name = 'media_id'
      ) AND NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'rider_media' AND column_name = 'id'
      ) THEN
        ALTER TABLE rider_media RENAME COLUMN media_id TO id;
      END IF;
    END $$;
  `);

  pgm.alterColumn("rider_media", "id", {
    default: pgm.func("gen_random_uuid()"),
  });

  pgm.addColumn("rider_media", {
    entity_id: { type: "uuid" },
    entity_type: { type: "text" },
    media_name: { type: "varchar(255)" },
    s3_key_original: { type: "text" },
    s3_key_processed: { type: "text" },
    s3_key_thumbnail: { type: "text" },
    category_type: { type: "text" },
    caption: { type: "text" },
    deleted_at: { type: "timestamp" },
  }, { ifNotExists: true });

  // Preserve existing source URL values.
  pgm.sql(`
    UPDATE rider_media
    SET s3_key_original = s3_url
    WHERE s3_url IS NOT NULL AND s3_key_original IS NULL;
  `);

  pgm.alterColumn("rider_media", "media_type", { type: "varchar(20)" });
  pgm.alterColumn("rider_media", "status", {
    type: "varchar(20)",
    default: "under_processing",
  });
  pgm.sql(`ALTER TABLE rider_media ALTER COLUMN status DROP NOT NULL;`);

  pgm.sql(`
    ALTER TABLE rider_media
    ALTER COLUMN created_at TYPE timestamp USING created_at::timestamp,
    ALTER COLUMN updated_at TYPE timestamp USING updated_at::timestamp;
  `);

  pgm.dropColumn("rider_media", "s3_url", { ifExists: true });
  pgm.dropColumn("rider_media", "verified_by", { ifExists: true });
  pgm.dropColumn("rider_media", "notes", { ifExists: true });
  pgm.dropColumn("rider_media", "created_by", { ifExists: true });

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE rider_documents
        DROP CONSTRAINT IF EXISTS rider_documents_media_fkey;
    EXCEPTION WHEN undefined_object THEN NULL;
    END $$;
  `);

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE rider_documents
        ADD CONSTRAINT rider_documents_media_fkey
        FOREIGN KEY (rider_media_id) REFERENCES rider_media(id) ON DELETE SET NULL;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE rider_documents
        DROP CONSTRAINT IF EXISTS rider_documents_media_fkey;
    EXCEPTION WHEN undefined_object THEN NULL;
    END $$;
  `);

  pgm.addColumn("rider_media", {
    s3_url: { type: "text" },
    verified_by: { type: "uuid" },
    notes: { type: "text" },
    created_by: { type: "uuid" },
  }, { ifNotExists: true });

  pgm.sql(`
    UPDATE rider_media
    SET s3_url = s3_key_original
    WHERE s3_key_original IS NOT NULL AND s3_url IS NULL;
  `);

  pgm.alterColumn("rider_media", "media_type", { type: "text", notNull: true });
  pgm.alterColumn("rider_media", "status", {
    type: "text",
    notNull: true,
    default: "pending",
  });

  pgm.sql(`
    ALTER TABLE rider_media
    ALTER COLUMN created_at TYPE timestamptz USING created_at::timestamptz,
    ALTER COLUMN updated_at TYPE timestamptz USING updated_at::timestamptz;
  `);

  pgm.dropColumn("rider_media", "entity_id", { ifExists: true });
  pgm.dropColumn("rider_media", "entity_type", { ifExists: true });
  pgm.dropColumn("rider_media", "media_name", { ifExists: true });
  pgm.dropColumn("rider_media", "s3_key_original", { ifExists: true });
  pgm.dropColumn("rider_media", "s3_key_processed", { ifExists: true });
  pgm.dropColumn("rider_media", "s3_key_thumbnail", { ifExists: true });
  pgm.dropColumn("rider_media", "category_type", { ifExists: true });
  pgm.dropColumn("rider_media", "caption", { ifExists: true });
  pgm.dropColumn("rider_media", "deleted_at", { ifExists: true });

  pgm.sql(`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'rider_media' AND column_name = 'id'
      ) AND NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'rider_media' AND column_name = 'media_id'
      ) THEN
        ALTER TABLE rider_media RENAME COLUMN id TO media_id;
      END IF;
    END $$;
  `);

  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE rider_documents
        ADD CONSTRAINT rider_documents_media_fkey
        FOREIGN KEY (rider_media_id) REFERENCES rider_media(media_id) ON DELETE SET NULL;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);
};
