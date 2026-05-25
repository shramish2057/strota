-- Rollback for migration 006.

DROP FUNCTION IF EXISTS prune_old_rate_limit_buckets();
DROP FUNCTION IF EXISTS ensure_today_salt();

DROP INDEX IF EXISTS ags_cache_entries_valid_until_idx;
DROP TABLE IF EXISTS ags_cache_entries;

DROP INDEX IF EXISTS public_rate_limit_buckets_bucket_date_idx;
DROP TABLE IF EXISTS public_rate_limit_buckets;

DROP TABLE IF EXISTS public_rate_limit_salts;
