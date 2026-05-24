"""Custom auth (ADR-0006): argon2id + JWT + rotating refresh tokens.

All flows: signup, email verification, login, password reset, magic link,
refresh, logout, current-user. No third-party auth provider.
"""
