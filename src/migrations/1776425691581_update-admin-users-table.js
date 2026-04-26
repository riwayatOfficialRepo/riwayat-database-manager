/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE admin_users ADD COLUMN status text;
    EXCEPTION WHEN duplicate_column THEN NULL;
    END $$;
  `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
     pgm.sql(`
    DO $$ 
    BEGIN
      ALTER TABLE admin_users DROP COLUMN status;
    EXCEPTION 
      WHEN undefined_column THEN NULL;
    END $$;
  `);
};
