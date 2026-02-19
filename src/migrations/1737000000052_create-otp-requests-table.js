/**
 * Migration: Create otp_requests table
 * Table for OTP requests with identity, code, type, status, trial counts, and timeouts
 */

exports.up = (pgm) => {
  pgm.createTable('otp_requests', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
      notNull: true
    },
    identity: {
      type: 'varchar(50)',
      notNull: true
    },
    otp_code: {
      type: 'varchar(10)',
      notNull: true
    },
    otp_type: {
      type: 'varchar(20)',
      notNull: true
    },
    status: {
      type: 'varchar(20)',
      notNull: true,
      default: 'pending'
    },
    signup_trial_count: {
      type: 'integer',
      notNull: true,
      default: 0
    },
    verify_trial_count: {
      type: 'integer',
      notNull: true,
      default: 0
    },
    resend_trial_count: {
      type: 'integer',
      notNull: true,
      default: 0
    },
    login_trial_count: {
      type: 'integer',
      notNull: true,
      default: 0
    },
    max_trials: {
      type: 'integer',
      notNull: true,
      default: 5
    },
    expires_at: {
      type: 'timestamp',
      notNull: true
    },
    timeout_until_signup: {
      type: 'timestamp'
    },
    timeout_until_verify: {
      type: 'timestamp'
    },
    timeout_until_resend: {
      type: 'timestamp'
    },
    timeout_until_login: {
      type: 'timestamp'
    },
    verified_at: {
      type: 'timestamp'
    },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('now()')
    },
    updated_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('now()')
    }
  }, { ifNotExists: true });

  // Composite index for lookups by identity, otp_type, and created_at (DESC)
  pgm.createIndex('otp_requests', [
    { name: 'identity', sort: 'ASC' },
    { name: 'otp_type', sort: 'ASC' },
    { name: 'created_at', sort: 'DESC' }
  ], {
    name: 'idx_otp_identity_type_created',
    ifNotExists: true
  });
};

exports.down = (pgm) => {
  pgm.dropIndex('otp_requests', [
    { name: 'identity', sort: 'ASC' },
    { name: 'otp_type', sort: 'ASC' },
    { name: 'created_at', sort: 'DESC' }
  ], {
    name: 'idx_otp_identity_type_created',
    ifExists: true
  });
  pgm.dropTable('otp_requests', { ifExists: true, cascade: true });
};
