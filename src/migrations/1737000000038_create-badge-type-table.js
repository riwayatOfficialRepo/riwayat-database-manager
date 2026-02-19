exports.up = (pgm) => {
  pgm.createTable('badge_type', {
    badge_code: {
      type: 'varchar(50)',
      primaryKey: true,
    },
    name: {
      type: 'varchar(100)',
      notNull: true,
    },
    description: {
      type: 'text',
    },
    category: {
      type: 'varchar(50)',
    },
    icon_url: {
      type: 'text',
    },
    is_system_managed: {
      type: 'boolean',
      notNull: true,
      default: true,
    },
    is_active: {
      type: 'boolean',
      notNull: true,
      default: true,
    },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('now()'),
    },
    updated_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('now()'),
    },
  }, { ifNotExists: true });
};

exports.down = (pgm) => {
  pgm.dropTable('badge_type', { ifExists: true, cascade: true });
};
