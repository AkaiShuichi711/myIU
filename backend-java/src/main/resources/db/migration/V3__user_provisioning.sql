-- ============================================================
-- V3: User provisioning fields
-- Users must be pre-provisioned by admin to access the system.
-- Only Microsoft SSO login is allowed for regular users.
-- ============================================================

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS is_active      BOOLEAN      NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS ms_tenant_id   VARCHAR(100),
  ADD COLUMN IF NOT EXISTS provisioned_by VARCHAR(255),
  ADD COLUMN IF NOT EXISTS provisioned_at TIMESTAMPTZ;

-- Existing users (created before this migration) are considered active
UPDATE users SET is_active = TRUE WHERE is_active IS NULL;

CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_email     ON users(email);
