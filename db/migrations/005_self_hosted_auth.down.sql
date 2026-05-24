-- Rollback for 005_self_hosted_auth.sql.
DROP FUNCTION IF EXISTS enforce_token_retention();

DROP TRIGGER IF EXISTS tg_updated_auth_users ON auth.users;

DROP TABLE IF EXISTS auth.refresh_tokens;
DROP TABLE IF EXISTS auth.magic_link_tokens;
DROP TABLE IF EXISTS auth.password_reset_tokens;
DROP TABLE IF EXISTS auth.email_verification_tokens;

ALTER TABLE auth.users
  DROP COLUMN IF EXISTS updated_at,
  DROP COLUMN IF EXISTS deleted_at,
  DROP COLUMN IF EXISTS locked_until,
  DROP COLUMN IF EXISTS failed_login_attempts,
  DROP COLUMN IF EXISTS last_login_at,
  DROP COLUMN IF EXISTS email_verified_at,
  DROP COLUMN IF EXISTS password_hash,
  DROP COLUMN IF EXISTS email_normalized;
