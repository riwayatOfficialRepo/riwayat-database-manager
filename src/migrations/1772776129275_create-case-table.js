exports.up = (pgm) => {
  // Create table
  pgm.createTable('cases', {
    case_id: {
      type: 'uuid',
      notNull: true,
      primaryKey: true,
    },
    case_number: {
      type: 'varchar(30)',
      notNull: true,
      unique: true,
    },
    primary_entity_type: { type: 'varchar(30)', notNull: true },
    primary_entity_id: { type: 'uuid', notNull: true },
    initiated_by_id: { type: 'uuid', notNull: true },
    initiated_by_role: { type: 'varchar(30)', notNull: true },
    raised_on_behalf_role: { type: 'varchar(30)', notNull: true },
    raised_on_behalf_id: { type: 'uuid' },
    assigned_queue: { type: 'varchar(50)', notNull: true },
    assigned_to: { type: 'uuid' },
    status: { type: 'varchar(30)', notNull: true, default: 'INITIATED' },
    priority: { type: 'varchar(20)', notNull: true },
    sla_due_at: { type: 'timestamptz' },
    title: { type: 'varchar(255)', notNull: true },
    description: { type: 'text' },
    idempotency_key: { type: 'varchar(100)' },
    created_at: { type: 'timestamptz', default: pgm.func('now()') },
    case_category: { type: 'varchar' },
    case_type: { type: 'varchar' },
    case_subtype: { type: 'varchar' },
    updated_at: { type: 'timestamptz' },
    current_actor: { type: 'uuid' },
    updated_by: { type: 'varchar' },
  });

  // Add composite unique constraint (initiated_by_id + idempotency_key)
  pgm.addConstraint(
    'cases',
    'cases_initiated_by_id_idempotency_key_key',
    {
      unique: ['initiated_by_id', 'idempotency_key'],
    }
  );
};

exports.down = (pgm) => {
  pgm.dropTable('cases', { ifExists: true });
};