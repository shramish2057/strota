-- Migration 006: public rate-limit tables + AGS cache for Phase 3.5 Genehmigungsfrei-Pruefer
--
-- Two concerns:
--   1) Rate-limit unauthenticated public requests by an IP-hash, not the raw IP.
--      Per DSGVO data-minimization, we never store the raw IP. We hash with a
--      daily-rotating server-side salt so the same IP across days has different
--      hashes (un-correlatable).
--   2) Cache the BKG-Geocoder responses (address -> AGS) for performance and to
--      reduce dependency on the BKG SLA. The bible's S1 spec calls for a
--      "local AGS-Cache mit monatlichem Sync".

CREATE TABLE IF NOT EXISTS public_rate_limit_salts (
  effective_date date PRIMARY KEY,
  salt_bytes     bytea       NOT NULL,
  created_at     timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public_rate_limit_salts IS
  'Daily-rotating salt for IP hashing in the public rate limiter. One row per UTC day.';

CREATE TABLE IF NOT EXISTS public_rate_limit_buckets (
  ip_hash_hex    text        NOT NULL,
  bucket_date    date        NOT NULL,
  surface        text        NOT NULL CHECK (surface IN ('genehmigungsfrei', 'dokument_analyse', 'strota_fragt')),
  request_count  integer     NOT NULL DEFAULT 0,
  first_seen_at  timestamptz NOT NULL DEFAULT now(),
  last_seen_at   timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (ip_hash_hex, bucket_date, surface)
);

COMMENT ON TABLE public_rate_limit_buckets IS
  'Per-IP-hash per-day request counter. Auto-pruned to 7 days for storage hygiene.';

CREATE INDEX IF NOT EXISTS public_rate_limit_buckets_bucket_date_idx
  ON public_rate_limit_buckets (bucket_date);

CREATE TABLE IF NOT EXISTS ags_cache_entries (
  query_norm     text        PRIMARY KEY,
  ags_8          text        NOT NULL CHECK (length(ags_8) = 8 AND ags_8 ~ '^[0-9]+$'),
  bundesland     text        NOT NULL,
  ort            text,
  plz            text,
  source         text        NOT NULL CHECK (source IN ('bkg_api', 'local_fallback', 'manual')),
  cached_at      timestamptz NOT NULL DEFAULT now(),
  valid_until    timestamptz NOT NULL
);

COMMENT ON TABLE ags_cache_entries IS
  'Normalized-address -> AGS mapping cache. Source = bkg_api when fetched live, local_fallback when resolved against the embedded PLZ-AGS table.';

CREATE INDEX IF NOT EXISTS ags_cache_entries_valid_until_idx
  ON ags_cache_entries (valid_until);

-- Helper: generate today's salt if not present (called from app code on cold start).
CREATE OR REPLACE FUNCTION ensure_today_salt() RETURNS bytea
  LANGUAGE plpgsql
  AS $$
DECLARE
  today_date date := (now() AT TIME ZONE 'UTC')::date;
  existing_salt bytea;
BEGIN
  SELECT salt_bytes INTO existing_salt FROM public_rate_limit_salts WHERE effective_date = today_date;
  IF existing_salt IS NOT NULL THEN
    RETURN existing_salt;
  END IF;
  existing_salt := gen_random_bytes(32);
  INSERT INTO public_rate_limit_salts (effective_date, salt_bytes)
    VALUES (today_date, existing_salt)
    ON CONFLICT (effective_date) DO UPDATE SET salt_bytes = public_rate_limit_salts.salt_bytes
    RETURNING salt_bytes INTO existing_salt;
  RETURN existing_salt;
END;
$$;

-- Helper: prune anything older than 7 days. Called on demand from the app.
CREATE OR REPLACE FUNCTION prune_old_rate_limit_buckets() RETURNS integer
  LANGUAGE plpgsql
  AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM public_rate_limit_buckets
    WHERE bucket_date < (now() AT TIME ZONE 'UTC')::date - INTERVAL '7 days';
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  DELETE FROM public_rate_limit_salts
    WHERE effective_date < (now() AT TIME ZONE 'UTC')::date - INTERVAL '7 days';
  RETURN deleted_count;
END;
$$;
