/**
 * customer_wallet_ledger.redemption_request_id → linked_request_id.
 *
 * The column now holds the id of the request a ledger entry belongs to (for
 * example the refund request of an ORDER_REFUND credit), not only redemptions.
 * Its unique constraint, created as wallet_ledger_redemption_request_id_key
 * before the table was renamed, is renamed to match.
 */
const TABLE = 'customer_wallet_ledger';
const OLD_CONSTRAINT = 'wallet_ledger_redemption_request_id_key';
const NEW_CONSTRAINT = 'customer_wallet_ledger_linked_request_id_key';

const renameConstraintIfExists = (pgm, from, to) => {
  pgm.sql(`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = '${from}' AND conrelid = 'public.${TABLE}'::regclass
      ) THEN
        ALTER TABLE public.${TABLE} RENAME CONSTRAINT ${from} TO ${to};
      END IF;
    END $$;
  `);
};

exports.up = (pgm) => {
  pgm.renameColumn(TABLE, 'redemption_request_id', 'linked_request_id');
  renameConstraintIfExists(pgm, OLD_CONSTRAINT, NEW_CONSTRAINT);
};

exports.down = (pgm) => {
  renameConstraintIfExists(pgm, NEW_CONSTRAINT, OLD_CONSTRAINT);
  pgm.renameColumn(TABLE, 'linked_request_id', 'redemption_request_id');
};
