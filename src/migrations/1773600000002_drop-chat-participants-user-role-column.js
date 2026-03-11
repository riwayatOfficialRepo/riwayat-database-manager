/**
 * Drop chat_participants.user_role
 *
 * We already store `user_entity_type` and no longer need `user_role`.
 */
exports.up = (pgm) => {
  // Drop column (idempotent)
  pgm.sql(`ALTER TABLE chat_participants DROP COLUMN IF EXISTS user_role;`);
};

exports.down = (pgm) => {
  // Re-add column as nullable to avoid breaking existing rows on rollback
  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE chat_participants
        ADD COLUMN IF NOT EXISTS user_role chat_participant_role;
    EXCEPTION WHEN duplicate_column THEN NULL;
    END $$;
  `);
};

