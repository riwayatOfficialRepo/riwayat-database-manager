exports.up = (pgm) => {
  // speeds up COUNT(*) and list queries filtered by soft-delete
  pgm.createIndex('change_requests', ['deleted_at'], {
    name: 'idx_change_requests_deleted_at',
    ifNotExists: true,
  });

  // speeds up status-based filtering (pending / approved / rejected)
  pgm.createIndex('change_requests', ['status'], {
    name: 'idx_change_requests_status',
    ifNotExists: true,
  });

  // speeds up lookups for a specific entity's change requests
  pgm.createIndex('change_requests', ['entity_name', 'entity_id'], {
    name: 'idx_change_requests_entity',
    ifNotExists: true,
  });

  // speeds up lookups per requesting user
  pgm.createIndex('change_requests', ['requested_by'], {
    name: 'idx_change_requests_requested_by',
    ifNotExists: true,
  });

  // speeds up ORDER BY created_at (pagination)
  pgm.createIndex('change_requests', ['created_at'], {
    name: 'idx_change_requests_created_at',
    ifNotExists: true,
  });
};

exports.down = (pgm) => {
  pgm.dropIndex('change_requests', [], { name: 'idx_change_requests_created_at',  ifExists: true });
  pgm.dropIndex('change_requests', [], { name: 'idx_change_requests_requested_by', ifExists: true });
  pgm.dropIndex('change_requests', [], { name: 'idx_change_requests_entity',       ifExists: true });
  pgm.dropIndex('change_requests', [], { name: 'idx_change_requests_status',       ifExists: true });
  pgm.dropIndex('change_requests', [], { name: 'idx_change_requests_deleted_at',   ifExists: true });
};
