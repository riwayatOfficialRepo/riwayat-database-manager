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
     (`DO $$ BEGIN
      ALTER TABLE cases ADD COLUMN kitchen_id UUID;
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
     (`DO $$ BEGIN
        ALTER TABLE cases DROP COLUMN kitchen_id UUID;
        EXCEPTION WHEN duplicate_column THEN NULL;
        END $$;
    `);
};
