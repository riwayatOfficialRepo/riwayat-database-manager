/**
 * Migration: Create change_requests table
 */

exports.up = (pgm) => {
  pgm.createTable(
    'change_requests',
    {
      id: {
        type: 'uuid',
        primaryKey: true,
        default: pgm.func('uuid_generate_v4()'),
        notNull: true,
      },
      requested_by: {
        type: 'uuid',
      },
      requested_by_role: {
        type: 'text',
        notNull: true,
      },
      entity_name: {
        type: 'text',
        notNull: true,
      },
      entity_id: {
        type: 'uuid',
      },
      sub_entity_name: {
        type: 'text',
      },
      sub_entity_id: {
        type: 'uuid',
      },
      action: {
        type: 'text',
        notNull: true,
      },
      reason: {
        type: 'text',
      },
      status: {
        type: 'text',
        notNull: true,
        default: 'pending',
      },
      reviewed_by: {
        type: 'uuid',
      },
      reviewed_at: {
        type: 'timestamp',
      },
      created_at: {
        type: 'timestamp',
        default: pgm.func('now()'),
      },
      updated_at: {
        type: 'timestamp',
        default: pgm.func('now()'),
      },
      workflow_id: {
        type: 'text',
        notNull: true,
      },
      deleted_at: {
        type: 'timestamp',
      },
      is_internal: {
        type: 'boolean',
        default: false,
      },
    },
    { ifNotExists: true },
  );
};

exports.down = (pgm) => {
  pgm.dropTable('change_requests', { ifExists: true, cascade: true });
};
