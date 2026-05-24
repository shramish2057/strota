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

    # Postgres (loopback on Hetzner CCX53 in production; docker on 55432 locally).
    database_url: str = Field(default="postgres://postgres:strota_dev@127.0.0.1:55432/strota")
    db_pool_min_size: int = Field(default=2, ge=1)
    db_pool_max_size: int = Field(default=10, ge=1)

    # Auth / JWT (ADR-0006).
    jwt_signing_key: str = Field(default="dev_only_change_me_dev_only_change_me", min_length=32)
    jwt_signing_key_previous: str | None = Field(default=None)
    jwt_algorithm: str = Field(default="HS256")
    jwt_issuer: str = Field(default="strota-api")
    jwt_audience: str = Field(default="strota-web")
    jwt_access_ttl_seconds: int = Field(default=900, ge=60)  # 15 minutes
    jwt_refresh_ttl_days: int = Field(default=30, ge=1)  # 30 days

    email_verification_ttl_hours: int = Field(default=24, ge=1)
    password_reset_ttl_hours: int = Field(default=24, ge=1)
    magic_link_ttl_minutes: int = Field(default=15, ge=1)

    # argon2id parameters (OWASP 2025 baseline; ~50ms on modern CPU).
    argon2_time_cost: int = Field(default=2, ge=1)
    argon2_memory_kib: int = Field(default=19_456, ge=8_192)
    argon2_parallelism: int = Field(default=1, ge=1)

    # Account lockout policy.
    max_failed_logins_per_hour: int = Field(default=5, ge=1)
    account_lock_minutes: int = Field(default=15, ge=1)
    password_min_length: int = Field(default=12, ge=8)

    # Postmark for transactional email (German templates).
    postmark_server_token: str | None = Field(default=None)
    email_from_address: str = Field(default="noreply@dev.strota.de")
    email_from_name: str = Field(default="Strota")
    public_web_url: str = Field(default="http://localhost:3000")


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Cached settings singleton.

    Pydantic validates required fields; missing HMAC_SECRET aborts startup.
    """
    return Settings()  # type: ignore[call-arg]
