"""Redis-backed replay-nonce store.

Each nonce is added via ``SET nonce:<value> 1 NX EX <ttl>``. The NX flag
ensures concurrent replay attempts within the TTL window fail atomically.

The store is intentionally a thin protocol: an in-memory implementation is
used in tests so we don't need a live Redis to exercise the middleware.
"""

from __future__ import annotations

from typing import Protocol

import redis.asyncio as redis_async


class NonceStore(Protocol):
    """Minimal nonce-store interface used by the auth middleware."""

    async def remember(self, nonce: str, ttl_seconds: int) -> bool:
        """Return True if this nonce is new; False if it has been seen recently."""


class RedisNonceStore:
    """Production Redis-backed implementation."""

    def __init__(self, url: str, *, key_prefix: str = "nonce:") -> None:
        self._client: redis_async.Redis = redis_async.from_url(url, decode_responses=True)
        self._prefix = key_prefix

    async def remember(self, nonce: str, ttl_seconds: int) -> bool:
        key = f"{self._prefix}{nonce}"
        # NX = only set if not exists; returns True on success, None on existing.
        result = await self._client.set(key, "1", nx=True, ex=ttl_seconds)
        return bool(result)

    async def close(self) -> None:
        await self._client.aclose()


class InMemoryNonceStore:
    """In-memory store for tests. Not safe for multi-process production use."""

    def __init__(self) -> None:
        self._seen: dict[str, float] = {}

    async def remember(self, nonce: str, ttl_seconds: int) -> bool:
        import time

        now = time.time()
        self._seen = {k: exp for k, exp in self._seen.items() if exp > now}
        if nonce in self._seen:
            return False
        self._seen[nonce] = now + ttl_seconds
        return True
