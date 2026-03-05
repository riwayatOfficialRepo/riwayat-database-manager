exports.up = (pgm) => {
  pgm.sql('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

  pgm.createTable('admin_users', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('uuid_generate_v4()') },
    name: { type: 'text', notNull: true },
    email: { type: 'text', notNull: true },
    phone: { type: 'text' },
    password_hash: { type: 'text', notNull: true },
    is_active: { type: 'boolean', default: true },
    last_login: { type: 'timestamp' },
    created_at: { type: 'timestamp', default: pgm.func('now()') },
    updated_at: { type: 'timestamp', default: pgm.func('now()') },
    deleted_at: { type: 'timestamp' },
  }, { ifNotExists: true });

  pgm.sql('CREATE UNIQUE INDEX IF NOT EXISTS admin_users_email_key ON admin_users (email)');
  pgm.sql('CREATE UNIQUE INDEX IF NOT EXISTS admin_users_phone_key ON admin_users (phone)');
};

exports.down = (pgm) => {
  pgm.dropTable('admin_users', { ifExists: true });
};
