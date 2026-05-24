"""Postgres connection pool + per-request RLS context.

The pool is process-wide. Each request acquires one connection, sets
`request.jwt.claim.sub` to the authenticated user id (or empty string for
anonymous public surfaces), runs the handler, then releases.

`SET LOCAL` scopes the claim to the current transaction. After we use the
connection in a `with conn.transaction()` block, RLS policies read it via
the `auth.uid()` helper defined in 001_initial_schema.sql.
"""

from __future__ import annotations

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from typing import Any

import psycopg
from psycopg import AsyncCursor
from psycopg.rows import DictRow, dict_row
from psycopg_pool import AsyncConnectionPool

from .config import get_settings
from .logging import get_logger

_log = get_logger("db")

# Singleton, created lazily so tests can stub it.
_pool: AsyncConnectionPool | None = None


async def get_pool() -> AsyncConnectionPool:
    global _pool
    if _pool is None:
        s = get_settings()
        # autocommit=True: each statement commits independently. Side-effect
        # rows (failed-login counter, refresh-token family-kill) MUST commit
        # before we raise, or a security event is lost. Flows that need
        # atomicity (signup) wrap an explicit `async with conn.transaction()`.
        _pool = AsyncConnectionPool(
            conninfo=s.database_url,
            min_size=s.db_pool_min_size,
            max_size=s.db_pool_max_size,
            kwargs={"autocommit": True, "row_factory": dict_row},
            open=False,
            check=AsyncConnectionPool.check_connection,
        )
        await _pool.open()
        _log.info("db.pool.open", min=s.db_pool_min_size, max=s.db_pool_max_size)
    return _pool


async def close_pool() -> None:
    global _pool
    if _pool is not None:
        await _pool.close()
        _pool = None
        _log.info("db.pool.closed")


@asynccontextmanager
async def session(
    *,
    user_id: str | None = None,
) -> AsyncIterator[psycopg.AsyncConnection]:
    """Acquire a connection and set the RLS claim for the duration.

    Connections from the pool are autocommit=True, so each statement commits
    independently. Flows that need atomicity (signup) wrap their own
    `async with conn.transaction()` block. This guarantees that side-effect
    rows like failed-login counters or refresh-token family-kills commit
    even when the call raises afterwards.

    Usage:
        async with session(user_id=str(uid)) as conn:
            async with conn.cursor() as cur:
                await cur.execute("SELECT id FROM projects")
    """
    pool = await get_pool()
    async with pool.connection() as conn:
        await _set_jwt_claim(conn, user_id)
        yield conn


async def _set_jwt_claim(conn: psycopg.AsyncConnection, user_id: str | None) -> None:
    """Set request.jwt.claim.sub for this connection.

    `is_local=false` (third arg) because in autocommit mode there is no
    transaction to scope SET LOCAL to; the GUC stays for this connection's
    lifetime, which is exactly the lifetime of the `async with session()`
    block (the pool resets settings on release via DISCARD).
    """
    async with conn.cursor() as cur:
        await cur.execute(
            "SELECT set_config('request.jwt.claim.sub', %s, false)",
            (user_id or "",),
        )


def dict_cursor(conn: psycopg.AsyncConnection) -> AsyncCursor[DictRow]:
    """Return a cursor whose `fetchone()` is typed as `DictRow | None`.

    The pool already sets row_factory=dict_row at the connection level, but
    mypy can't trace that through psycopg's stubs, so callers that want
    typed dict access use this helper instead of `conn.cursor()` directly.
    """
    return conn.cursor(row_factory=dict_row)


async def fetch_one(
    conn: psycopg.AsyncConnection, query: str, *args: Any
) -> DictRow | None:
    async with dict_cursor(conn) as cur:
        await cur.execute(query, args)
        return await cur.fetchone()


async def fetch_all(
    conn: psycopg.AsyncConnection, query: str, *args: Any
) -> list[DictRow]:
    async with dict_cursor(conn) as cur:
        await cur.execute(query, args)
        return await cur.fetchall()


async def execute(conn: psycopg.AsyncConnection, query: str, *args: Any) -> None:
    async with conn.cursor() as cur:
        await cur.execute(query, args)
