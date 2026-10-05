exports.up = (pgm) => {
  pgm.createTable(
    'inventory_reservation_ledger',
    {
      id:                         { type: 'uuid',        primaryKey: true, default: pgm.func('gen_random_uuid()'), notNull: true },
      variant_inventory_daily_id: { type: 'uuid',        notNull: true, references: 'variant_inventory_daily', onDelete: 'CASCADE' },
      dish_variant_id:            { type: 'uuid',        notNull: true },
      inventory_date:             { type: 'date',        notNull: true },
      order_id:                   { type: 'uuid',        notNull: true },
      quantity:                   { type: 'integer',     notNull: true },
      status:                     { type: 'varchar(20)', notNull: true, default: 'RESERVED' },
      reserved_at:                { type: 'timestamptz', default: pgm.func('now()') },
      released_at:                { type: 'timestamptz' },
      consumed_at:                { type: 'timestamptz' },
      expires_at:                 { type: 'timestamptz' },
      created_at:                 { type: 'timestamptz', default: pgm.func('now()') },
      updated_at:                 { type: 'timestamptz', default: pgm.func('now()') },
    },
    { ifNotExists: true },
  );

  pgm.createIndex('inventory_reservation_ledger', ['variant_inventory_daily_id', 'status'], { ifNotExists: true });
  pgm.createIndex('inventory_reservation_ledger', ['order_id'], { ifNotExists: true });

  pgm.sql(`
    CREATE OR REPLACE FUNCTION update_inventory_reservation_ledger_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  pgm.sql(`
    CREATE OR REPLACE TRIGGER trg_update_inventory_reservation_ledger
      BEFORE UPDATE ON inventory_reservation_ledger
      FOR EACH ROW
      EXECUTE FUNCTION update_inventory_reservation_ledger_updated_at();
  `);
};

exports.down = (pgm) => {
  pgm.sql(`DROP TRIGGER IF EXISTS trg_update_inventory_reservation_ledger ON inventory_reservation_ledger`);
  pgm.sql(`DROP FUNCTION IF EXISTS update_inventory_reservation_ledger_updated_at()`);
  pgm.dropTable('inventory_reservation_ledger', { ifExists: true, cascade: true });
};
