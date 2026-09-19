exports.up = (pgm) => {
  pgm.createTable(
    'variant_inventory_daily',
    {
      id:                  { type: 'uuid',        primaryKey: true, default: pgm.func('gen_random_uuid()'), notNull: true },
      kitchen_id:          { type: 'uuid',        notNull: true, references: 'kitchens',      onDelete: 'CASCADE' },
      dish_id:             { type: 'uuid',        notNull: true, references: 'dishes',        onDelete: 'CASCADE' },
      dish_variant_id:     { type: 'uuid',        notNull: true, references: 'dish_variants', onDelete: 'CASCADE' },
      inventory_date:      { type: 'date',        notNull: true },
      quantity_available:  { type: 'integer' },
      status:              { type: 'varchar(20)', notNull: true, default: 'LIVE' },
      sold_out_at:         { type: 'timestamptz' },
      paused_at:           { type: 'timestamptz' },
      created_at:          { type: 'timestamptz', default: pgm.func('now()') },
      updated_at:          { type: 'timestamptz', default: pgm.func('now()') },
    },
    { ifNotExists: true },
  );

  pgm.addConstraint('variant_inventory_daily', 'variant_inventory_daily_variant_date_key', {
    unique: ['dish_variant_id', 'inventory_date'],
  });

  pgm.createIndex('variant_inventory_daily', ['kitchen_id', 'inventory_date']);

  pgm.sql(`
    CREATE OR REPLACE FUNCTION update_variant_inventory_daily_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  pgm.sql(`
    CREATE OR REPLACE TRIGGER trg_update_variant_inventory_daily
      BEFORE UPDATE ON variant_inventory_daily
      FOR EACH ROW
      EXECUTE FUNCTION update_variant_inventory_daily_updated_at();
  `);
};

exports.down = (pgm) => {
  pgm.sql(`DROP TRIGGER IF EXISTS trg_update_variant_inventory_daily ON variant_inventory_daily`);
  pgm.sql(`DROP FUNCTION IF EXISTS update_variant_inventory_daily_updated_at()`);
  pgm.dropTable('variant_inventory_daily', { ifExists: true, cascade: true });
};
