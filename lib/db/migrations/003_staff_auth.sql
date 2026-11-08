-- V0-26. Columns the staff session needs that 001 left for this step.
-- Safe to run more than once.

ALTER TABLE biomeg.users
  ADD COLUMN IF NOT EXISTS must_change_password boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS password_expires_at timestamptz;

ALTER TABLE biomeg.staff_sessions
  ADD COLUMN IF NOT EXISTS locked_at timestamptz,
  ADD COLUMN IF NOT EXISTS ended_at timestamptz;

CREATE INDEX IF NOT EXISTS staff_sign_in_failures_lookup
  ON biomeg.staff_sign_in_failures (username_key, address, failed_at DESC);

CREATE INDEX IF NOT EXISTS staff_sessions_open_workstation
  ON biomeg.staff_sessions (workstation)
  WHERE ended_at IS NULL;
