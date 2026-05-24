-- =====================================================================
-- 005_self_hosted_auth.sql
-- Architecture pivot: we own auth (ADR-0006). The auth.users stub in 001
-- becomes a real table with password_hash, email_verified_at, lockout
-- counters, and tokens for email-verify / password-reset / magic-link /
-- refresh. FastAPI is the only writer; RLS still uses auth.uid() to
-- harden against accidental cross-org reads.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Expand auth.users with real columns.
-- 001 created auth.users with only (id, email, created_at). Augment.
-- ---------------------------------------------------------------------
ALTER TABLE auth.users
  ADD COLUMN IF NOT EXISTS email_normalized text
    GENERATED ALWAYS AS (lower(email)) STORED,
  ADD COLUMN IF NOT EXISTS password_hash text,
  ADD COLUMN IF NOT EXISTS email_verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS last_login_at timestamptz,
  ADD COLUMN IF NOT EXISTS failed_login_attempts integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS locked_until timestamptz,
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

CREATE UNIQUE INDEX IF NOT EXISTS auth_users_email_normalized_idx
  ON auth.users (email_normalized)
  WHERE deleted_at IS NULL;

-- ---------------------------------------------------------------------
-- Token tables (one row per active token; consumed/expired rows kept
-- briefly for audit, then purged by enforce_token_retention()).
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS auth.email_verification_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  token_hash text NOT NULL,                  -- sha256 of plaintext token
  expires_at timestamptz NOT NULL,
  consumed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ev_tokens_user_idx
  ON auth.email_verification_tokens(user_id) WHERE consumed_at IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS ev_tokens_hash_idx
  ON auth.email_verification_tokens(token_hash);

CREATE TABLE IF NOT EXISTS auth.password_reset_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  token_hash text NOT NULL,
  expires_at timestamptz NOT NULL,
  consumed_at timestamptz,
  requested_ip_hash text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS pr_tokens_user_idx
  ON auth.password_reset_tokens(user_id) WHERE consumed_at IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS pr_tokens_hash_idx
  ON auth.password_reset_tokens(token_hash);

CREATE TABLE IF NOT EXISTS auth.magic_link_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  token_hash text NOT NULL,
  expires_at timestamptz NOT NULL,
  consumed_at timestamptz,
  requested_ip_hash text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ml_tokens_user_idx
  ON auth.magic_link_tokens(user_id) WHERE consumed_at IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS ml_tokens_hash_idx
  ON auth.magic_link_tokens(token_hash);

-- Refresh tokens drive rotating session JWTs. We store only the hash so a
-- DB leak does not yield usable refresh tokens.
CREATE TABLE IF NOT EXISTS auth.refresh_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  token_hash text NOT NULL,
  family_id uuid NOT NULL,                   -- rotation family
  parent_id uuid REFERENCES auth.refresh_tokens, -- rotation lineage
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  revoked_reason text,
  user_agent text,
  ip_hash text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS rt_user_active_idx
  ON auth.refresh_tokens(user_id) WHERE revoked_at IS NULL;
CREATE INDEX IF NOT EXISTS rt_family_idx
  ON auth.refresh_tokens(family_id);
CREATE UNIQUE INDEX IF NOT EXISTS rt_hash_idx
  ON auth.refresh_tokens(token_hash);

-- ---------------------------------------------------------------------
-- updated_at trigger for auth.users (the cross-schema DO loop in 003
-- only walks public.*).
-- ---------------------------------------------------------------------
DROP TRIGGER IF EXISTS tg_updated_auth_users ON auth.users;
CREATE TRIGGER tg_updated_auth_users BEFORE UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------
-- Retention: purge consumed/expired tokens older than 30 days. Called by
-- the same hourly cron that runs enforce_10y_retention.
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION enforce_token_retention()
RETURNS TABLE (table_name text, deleted_rows bigint)
LANGUAGE plpgsql AS $$
DECLARE
  deleted bigint;
BEGIN
  DELETE FROM auth.email_verification_tokens
   WHERE (consumed_at IS NOT NULL OR expires_at < now())
     AND COALESCE(consumed_at, expires_at) < now() - interval '30 days';
  GET DIAGNOSTICS deleted = ROW_COUNT;
  table_name := 'email_verification_tokens'; deleted_rows := deleted; RETURN NEXT;

  DELETE FROM auth.password_reset_tokens
   WHERE (consumed_at IS NOT NULL OR expires_at < now())
     AND COALESCE(consumed_at, expires_at) < now() - interval '30 days';
  GET DIAGNOSTICS deleted = ROW_COUNT;
  table_name := 'password_reset_tokens'; deleted_rows := deleted; RETURN NEXT;

  DELETE FROM auth.magic_link_tokens
   WHERE (consumed_at IS NOT NULL OR expires_at < now())
     AND COALESCE(consumed_at, expires_at) < now() - interval '30 days';
  GET DIAGNOSTICS deleted = ROW_COUNT;
  table_name := 'magic_link_tokens'; deleted_rows := deleted; RETURN NEXT;

  DELETE FROM auth.refresh_tokens
   WHERE (revoked_at IS NOT NULL OR expires_at < now())
     AND COALESCE(revoked_at, expires_at) < now() - interval '30 days';
  GET DIAGNOSTICS deleted = ROW_COUNT;
  table_name := 'refresh_tokens'; deleted_rows := deleted; RETURN NEXT;
END;
$$;

-- ---------------------------------------------------------------------
-- Lock down access. Only the FastAPI service role (added in production
-- bootstrap, not here) reads/writes auth.*. The authenticated role used
-- by web users has no access.
-- ---------------------------------------------------------------------
REVOKE ALL ON ALL TABLES IN SCHEMA auth FROM PUBLIC;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA auth FROM PUBLIC;
