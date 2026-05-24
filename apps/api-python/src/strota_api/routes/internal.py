"""Internal authenticated routes used to exercise the auth middleware.

Phase 1 only ships ``/internal/echo`` to prove the HMAC + mTLS pipeline works
end-to-end. Real workflow routes (file validation, AI streaming, B-Plan vision)
arrive in their respective phases.
"""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Request

router = APIRouter(prefix="/internal", tags=["internal"])


@router.post("/echo")
async def echo(request: Request) -> dict[str, Any]:
    """Echo back the request body and selected headers.

    Used by the cross-service HMAC round-trip test in ``tests/test_round_trip.py``.
    """
    body = await request.body()
    return {
        "received_bytes": len(body),
        "body_text": body.decode("utf-8", errors="replace"),
    }
