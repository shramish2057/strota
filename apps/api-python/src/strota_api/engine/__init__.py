"""Strota Verfahrensbestimmung engine.

Public API:
  - evaluate_genehmigungsfrei(...) -> Verdict
  - resolve_ags(...) -> AGSResolution
  - check_and_consume_rate_limit(...) -> RateLimitResult

The engine is deterministic. No AI calls. Every Verdict is reproducible from
the same inputs against the same corpus version.
"""

from .verfahrensfreie import (
    GenehmigungsfreiInput,
    SonderlageHinweis,
    Verdict,
    VerdictType,
    evaluate_genehmigungsfrei,
)

__all__ = [
    "GenehmigungsfreiInput",
    "SonderlageHinweis",
    "Verdict",
    "VerdictType",
    "evaluate_genehmigungsfrei",
]
