exports.up = (pgm) => {
  pgm.createTable(
    'variant_inventory_daily_history',
    {
      id:                           { type: 'uuid',         primaryKey: true, default: pgm.func('gen_random_uuid()'), notNull: true },
      variant_inventory_daily_id:   { type: 'uuid',         notNull: true, references: 'variant_inventory_daily', onDelete: 'CASCADE' },
      dish_variant_id:              { type: 'uuid',         notNull: true },
      inventory_date:               { type: 'date',         notNull: true },
      action:                       { type: 'varchar(30)',  notNull: true },
      previous_status:              { type: 'varchar(20)' },
      new_status:                   { type: 'varchar(20)' },
      previous_quantity_available:  { type: 'integer' },
      new_quantity_available:       { type: 'integer' },
      initiator_type:               { type: 'varchar(20)' },
      initiator_id:                 { type: 'varchar(255)' },
      initiator_detail:             { type: 'jsonb' },
      trace_id:                     { type: 'varchar(255)' },
      created_at:                   { type: 'timestamptz',  default: pgm.func('now()') },
    },
    { ifNotExists: true },
  );

  pgm.createIndex('variant_inventory_daily_history', ['variant_inventory_daily_id', 'created_at']);
};

exports.down = (pgm) => {
  pgm.dropTable('variant_inventory_daily_history', { ifExists: true, cascade: true });
};
