exports.up = (pgm) => {
  // A receipts row is now written as soon as a request arrives (IN_PROGRESS) and its status is
  // updated at every step. GENERATION_FAILED and UPLOAD_FAILED can be retried; FAILED is final.
  pgm.sql(`ALTER TABLE receipts DROP CONSTRAINT IF EXISTS chk_receipts_status`);
  pgm.sql(`
    ALTER TABLE receipts
      ADD CONSTRAINT chk_receipts_status
      CHECK (status IN ('IN_PROGRESS', 'GENERATED', 'FAILED', 'GENERATION_FAILED', 'UPLOAD_FAILED'))
  `);

  pgm.addColumn('receipts', {
    retry_count: { type: 'integer', notNull: true, default: 0 },
  }, { ifNotExists: true });

  // An empty or missing payload is saved as received, with status FAILED.
  pgm.alterColumn('receipts', 'payload', { notNull: false });

  // Used by the retry job to find retryable and stuck rows.
  pgm.sql(`CREATE INDEX IF NOT EXISTS idx_receipts_status_updated_at ON receipts (status, updated_at)`);
};

exports.down = (pgm) => {
  pgm.sql(`DROP INDEX IF EXISTS idx_receipts_status_updated_at`);
  pgm.sql(`UPDATE receipts SET payload = '{}'::jsonb WHERE payload IS NULL`);
  pgm.alterColumn('receipts', 'payload', { notNull: true });
  pgm.dropColumn('receipts', 'retry_count', { ifExists: true });
  pgm.sql(`ALTER TABLE receipts DROP CONSTRAINT IF EXISTS chk_receipts_status`);
  pgm.sql(`UPDATE receipts SET status = 'FAILED' WHERE status NOT IN ('GENERATED', 'FAILED')`);
  pgm.sql(`
    ALTER TABLE receipts
      ADD CONSTRAINT chk_receipts_status CHECK (status IN ('GENERATED', 'FAILED'))
  `);
};
