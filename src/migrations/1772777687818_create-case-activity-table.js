exports.up = (pgm) => {
  // Create table
  pgm.createTable('case_activity', {
    id: {
      type: 'bigserial', // GENERATED ALWAYS AS IDENTITY
      primaryKey: true,
    },
    case_id: {
      type: 'uuid',
      notNull: true,
    },
    activity_type: {
      type: 'varchar(30)',
      notNull: true,
    },
    actor_id: {
      type: 'uuid',
      notNull: true,
    },
    actor_role: {
      type: 'varchar(30)',
      notNull: true,
    },
    comment: { type: 'text' },
    metadata: { type: 'jsonb' },
    actor_name: { type: 'varchar' },
    created_at: { type: 'timestamp', default: pgm.func('now()') },
  });

  // Add foreign key to cases table
  pgm.addConstraint('case_activity', 'case_activity_case_id_fkey', {
    foreignKeys: {
      columns: 'case_id',
      references: 'cases(case_id)',
      onUpdate: 'NO ACTION',
      onDelete: 'NO ACTION',
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('case_activity', { ifExists: true });
};