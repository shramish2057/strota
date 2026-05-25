"""Public IP-hash rate limiter, Postgres-backed.

Bible Surface S1 spec:
  - 10 checks/day unauthenticated per IP.
  - Stored as IP hash, not raw IP.
  - Salt rotates daily.
  - DSGVO data-minimization: never persist the raw client IP.

We hash with SHA-256 over (raw_ip || daily_salt) and bucket by UTC date.
"""

from __future__ import annotations

import hashlib
from dataclasses import dataclass
from datetime import UTC, datetime
from typing import Literal

from ..config import get_settings
from ..db import dict_cursor, get_pool

SURFACES = ("genehmigungsfrei", "dokument_analyse", "strota_fragt")
Surface = Literal["genehmigungsfrei", "dokument_analyse", "strota_fragt"]


@dataclass
class RateLimitResult:
    allowed: bool
    count_today: int
    limit_per_day: int
    bucket_date: str
    reason: str | None = None


async def _today_salt() -> bytes:
    pool = await get_pool()
    async with pool.connection() as conn:
        async with dict_cursor(conn) as cur:
            await cur.execute("SELECT ensure_today_salt() AS salt")
            row = await cur.fetchone()
    if row is None or row.get("salt") is None:
        raise RuntimeError("ensure_today_salt() did not return a salt")
    raw = row["salt"]
    if isinstance(raw, memoryview):
        return raw.tobytes()
    return bytes(raw)


def _hash_ip(ip: str, salt: bytes) -> str:
    return hashlib.sha256(salt + ip.encode("utf-8")).hexdigest()


async def check_and_consume_rate_limit(
    raw_ip: str,
    surface: Surface,
) -> RateLimitResult:
    """Atomically increment the daily counter for (ip_hash, surface). If the
    new count exceeds the per-day limit, returns allowed=False without
    actually consuming a slot (transactional CHECK-and-INSERT)."""

    if surface not in SURFACES:
        raise ValueError(f"Unknown surface: {surface!r}")
    if not raw_ip:
        raise ValueError("raw_ip required")

    settings = get_settings()
    limit = settings.public_rate_limit_per_day

    salt = await _today_salt()
    ip_hash = _hash_ip(raw_ip, salt)
    today = datetime.now(UTC).date()

    pool = await get_pool()
    async with pool.connection() as conn:
        async with conn.transaction():
            async with dict_cursor(conn) as cur:
                await cur.execute(
                    """
                    SELECT request_count FROM public_rate_limit_buckets
                      WHERE ip_hash_hex = %s
                        AND bucket_date = %s
                        AND surface = %s
                      FOR UPDATE
                    """,
                    (ip_hash, today, surface),
                )
                row = await cur.fetchone()
                current = int(row["request_count"]) if row else 0

                if current >= limit:
                    return RateLimitResult(
                        allowed=False,
                        count_today=current,
                        limit_per_day=limit,
                        bucket_date=today.isoformat(),
                        reason=(
                            f"Tageslimit von {limit} Pruefungen pro IP fuer Surface "
                            f"{surface!r} bereits erreicht."
                        ),
                    )

                await cur.execute(
                    """
                    INSERT INTO public_rate_limit_buckets
                      (ip_hash_hex, bucket_date, surface, request_count, first_seen_at, last_seen_at)
                    VALUES (%s, %s, %s, 1, now(), now())
                    ON CONFLICT (ip_hash_hex, bucket_date, surface) DO UPDATE
                      SET request_count = public_rate_limit_buckets.request_count + 1,
                          last_seen_at = now()
                    RETURNING request_count
                    """,
                    (ip_hash, today, surface),
                )
                new_row = await cur.fetchone()
                new_count = int(new_row["request_count"]) if new_row else (current + 1)

    return RateLimitResult(
        allowed=True,
        count_today=new_count,
        limit_per_day=limit,
        bucket_date=today.isoformat(),
        reason=None,
    )


async def prune_old_buckets() -> int:
    """Drop rate-limit buckets older than 7 days. Cron-callable."""
    pool = await get_pool()
    async with pool.connection() as conn:
        async with dict_cursor(conn) as cur:
            await cur.execute("SELECT prune_old_rate_limit_buckets() AS deleted")
            row = await cur.fetchone()
    if row is None:
        return 0
    return int(row.get("deleted") or 0)
