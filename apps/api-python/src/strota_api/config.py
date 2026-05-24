"""Runtime configuration loaded from environment variables.

Secrets are NEVER hard-coded. Production values come from HashiCorp Vault or
Vercel/Hetzner secrets. Local development reads from .env in this directory.
"""

from __future__ import annotations

from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Service settings, validated at startup."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    service_name: str = Field(default="strota-api")
    environment: str = Field(default="development", description="dev/staging/prod")
    log_level: str = Field(default="INFO")

    # Inter-service auth (ADR-0002, v5.0 hardening)
    hmac_secret: str = Field(
        ...,
        min_length=32,
        description="Shared secret for HMAC-SHA256, rotated monthly via CI.",
    )
    hmac_secret_previous: str | None = Field(
        default=None,
        description="During rotation overlap window the previous secret is also accepted.",
    )
    hmac_skew_seconds: int = Field(
        default=60,
        description="v5.0: skew widened from 30s to 60s for NTP-drift tolerance.",
    )
    nonce_ttl_seconds: int = Field(
        default=120,
        description="Redis TTL for replay-nonce, must be >= skew_seconds.",
    )

    # Redis for nonce store + rate limiting
    redis_url: str = Field(default="redis://localhost:6379/0")

    # mTLS client cert allowlist (SHA-256 fingerprints, hex, lowercase)
    mtls_allowed_fingerprints: list[str] = Field(default_factory=list)
    # Revoked cert serials (also kept in Redis SET for live revocation).
    mtls_crl_redis_key: str = Field(default="mtls:revoked_serials")


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Cached settings singleton.

    Pydantic validates required fields; missing HMAC_SECRET aborts startup.
    """
    return Settings()  # type: ignore[call-arg]
