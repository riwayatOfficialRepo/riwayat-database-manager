exports.up = (pgm) => {
  pgm.sql(`
    UPDATE kitchen_addresses
    SET delivery_instructions = delivery_instruction
    WHERE delivery_instructions IS NULL
      AND delivery_instruction IS NOT NULL
  `);
  pgm.sql(`
    UPDATE kitchen_addresses_staging
    SET delivery_instructions = delivery_instruction
    WHERE delivery_instructions IS NULL
      AND delivery_instruction IS NOT NULL
  `);
};

exports.down = (pgm) => {
  pgm.sql(`UPDATE kitchen_addresses         SET delivery_instructions = NULL`);
  pgm.sql(`UPDATE kitchen_addresses_staging SET delivery_instructions = NULL`);
};
