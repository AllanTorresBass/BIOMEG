-- Seed the laboratory owner account (Administración).
-- The password hash is set by scripts/install-admin.mjs, never in this file.

BEGIN;
SET LOCAL search_path TO biomeg, public;

INSERT INTO users (id, username, display_name, active)
VALUES (
  'a0000000-0000-4000-8000-000000000001',
  'superadmin',
  'Super Admin BIOMEG',
  true
)
ON CONFLICT (username) DO UPDATE
SET display_name = EXCLUDED.display_name,
    active = true;

INSERT INTO user_roles (user_id, role_id)
VALUES ('a0000000-0000-4000-8000-000000000001', 'administracion')
ON CONFLICT DO NOTHING;

COMMIT;
