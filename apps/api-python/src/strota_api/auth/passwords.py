"""argon2id password hashing.

Parameters come from the Settings singleton so they can be tuned per
environment. Defaults are the OWASP 2025 baseline:
  time_cost=2, memory_kib=19_456 (~19 MiB), parallelism=1.

This intentionally takes ~50 ms on a modern CPU. Anything faster opens
us up to offline cracking; anything slower hurts UX without much win.
"""

from __future__ import annotations

from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerifyMismatchError

from ..config import get_settings


def _hasher() -> PasswordHasher:
    s = get_settings()
    return PasswordHasher(
        time_cost=s.argon2_time_cost,
        memory_cost=s.argon2_memory_kib,
        parallelism=s.argon2_parallelism,
    )


def hash_password(password: str) -> str:
    """Return the argon2id PHC-encoded hash for `password`."""
    return _hasher().hash(password)


def verify_password(password_hash: str, password: str) -> bool:
    """Constant-time verify. Returns False on any verification failure;
    raises only on logic bugs (e.g. malformed hash from a different algo)."""
    try:
        return _hasher().verify(password_hash, password)
    except VerifyMismatchError:
        return False
    except InvalidHashError:
        # If the stored hash is malformed, do NOT raise into a user-facing
        # 500. Treat as auth failure; the SRE will see it in audit_log.
        return False


def needs_rehash(password_hash: str) -> bool:
    """True if the hash was made with weaker parameters than current settings."""
    return _hasher().check_needs_rehash(password_hash)
