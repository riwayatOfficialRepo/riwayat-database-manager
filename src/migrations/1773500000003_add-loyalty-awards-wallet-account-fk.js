exports.up = (pgm) => {
  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE loyalty_awards
        ADD CONSTRAINT loyalty_awards_wallet_account_id_fkey
        FOREIGN KEY (wallet_account_id) REFERENCES wallet_accounts (wallet_account_id)
        ON UPDATE NO ACTION ON DELETE NO ACTION;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    ALTER TABLE loyalty_awards
      DROP CONSTRAINT IF EXISTS loyalty_awards_wallet_account_id_fkey;
  `);
};
