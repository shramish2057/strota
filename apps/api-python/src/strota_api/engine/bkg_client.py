"""BKG (Bundesamt fuer Kartographie und Geodaesie) Geocoder client.

The BKG runs the official Bundes-Geokodierungsdienst at sg.geodatenzentrum.de.
A free WMS/WFS tier is available; the higher-tier paid endpoint returns
structured AGS codes for any German address. This client supports both, and
falls back to a local PLZ-to-AGS lookup if no API key is configured (bible
S1 spec: "BKG-Outage-Fallback: local AGS-Cache mit monatlichem Sync").

Returns AGSResolution objects with the source tagged so callers can decide
whether to warn the user (cached vs live).
"""

from __future__ import annotations

import json
import logging
import re
from dataclasses import dataclass
from datetime import UTC, datetime, timedelta
from typing import Literal

import httpx

from ..config import get_settings
from ..corpus import get_bauamt_directory
from ..db import dict_cursor, get_pool

logger = logging.getLogger(__name__)


# -----------------------------------------------------------------------------
# Public result type
# -----------------------------------------------------------------------------


@dataclass
class AGSResolution:
    ags_8: str
    bundesland: str
    ort: str | None
    plz: str | None
    source: Literal["bkg_api", "local_fallback", "cache", "manual"]
    cache_warning: bool = False


# -----------------------------------------------------------------------------
# Local PLZ-to-AGS lookup for Bayern (used when no BKG key is configured)
#
# This is a coarse mapping covering the largest Bayern Staedte and the typical
# PLZ-Bereiche per Landkreis. It is intentionally not exhaustive: when the
# real BKG API is available, set BKG_API_KEY and that takes precedence.
# -----------------------------------------------------------------------------


_BAYERN_PLZ_PREFIX_TO_AGS5: list[tuple[str, str, str]] = [
    # (PLZ-Praefix, AGS-Kreis, Ort/Region)
    ("80", "09162", "Muenchen"),
    ("81", "09162", "Muenchen"),
    ("83", "09163", "Rosenheim"),
    ("82", "09188", "Starnberg"),
    ("85", "09161", "Ingolstadt"),
    ("86", "09761", "Augsburg"),
    ("87", "09763", "Kempten"),
    ("88", "09776", "Lindau"),
    ("90", "09564", "Nuernberg"),
    ("91", "09565", "Schwabach"),
    ("92", "09362", "Regensburg"),
    ("93", "09362", "Regensburg"),
    ("94", "09262", "Passau"),
    ("95", "09464", "Hof"),
    ("96", "09461", "Bamberg"),
    ("97", "09663", "Wuerzburg"),
]


def _normalize_query(raw: str) -> str:
    return re.sub(r"\s+", " ", raw.strip().lower())


def _local_resolve(address: str) -> AGSResolution | None:
    norm = _normalize_query(address)
    # Pull PLZ out of the address (5-digit run, German format).
    plz_match = re.search(r"\b(\d{5})\b", address)
    plz = plz_match.group(1) if plz_match else None

    directory = get_bauamt_directory("BY")
    candidates = directory["bauaufsichtsbehoerden"]

    # Strategy 1: PLZ prefix lookup against Bayern table.
    if plz and plz[:2] in {p for p, _, _ in _BAYERN_PLZ_PREFIX_TO_AGS5}:
        for prefix, ags5, ort in _BAYERN_PLZ_PREFIX_TO_AGS5:
            if plz.startswith(prefix):
                return AGSResolution(
                    ags_8=ags5 + "000",
                    bundesland="Bayern",
                    ort=ort,
                    plz=plz,
                    source="local_fallback",
                    cache_warning=True,
                )

    # Strategy 2: textual match of the Behoerden name against the address string.
    for entry in candidates:
        name_norm = _normalize_query(entry["name"].replace("Landkreis ", ""))
        if name_norm and name_norm in norm:
            return AGSResolution(
                ags_8=entry["ags_kreis"] + "000",
                bundesland="Bayern",
                ort=entry["name"].replace("Landkreis ", "").replace("Landeshauptstadt ", ""),
                plz=plz,
                source="local_fallback",
                cache_warning=True,
            )

    return None


# -----------------------------------------------------------------------------
# BKG live client
# -----------------------------------------------------------------------------


async def _bkg_lookup(address: str) -> AGSResolution | None:
    settings = get_settings()
    if not settings.bkg_api_key:
        return None
    # The Bundes-Geokodierungsdienst uses the URL pattern
    # https://sg.geodatenzentrum.de/gdz_geokodierung_bund__<TOKEN>/geosearch
    # We accept a configurable base and append the token.
    url = f"{settings.bkg_base_url.rstrip('/')}{settings.bkg_api_key}/geosearch"
    params = {"query": address, "format": "json", "count": "1"}
    try:
        async with httpx.AsyncClient(timeout=settings.bkg_timeout_seconds) as client:
            resp = await client.get(url, params=params)
            if resp.status_code != 200:
                logger.warning("bkg_non_200", extra={"status": resp.status_code})
                return None
            data = resp.json()
    except (TimeoutError, httpx.HTTPError, json.JSONDecodeError) as exc:
        logger.warning("bkg_call_failed", extra={"err": str(exc)})
        return None

    features = data.get("features") or []
    if not features:
        return None
    props = features[0].get("properties") or {}
    ags = (props.get("ags") or "").strip()
    if not ags or not ags.isdigit() or len(ags) != 8:
        return None
    return AGSResolution(
        ags_8=ags,
        bundesland=str(props.get("bundesland", "")),
        ort=props.get("ort"),
        plz=props.get("plz"),
        source="bkg_api",
        cache_warning=False,
    )


# -----------------------------------------------------------------------------
# Cache layer
# -----------------------------------------------------------------------------


async def _cache_get(query_norm: str) -> AGSResolution | None:
    pool = await get_pool()
    now = datetime.now(UTC)
    async with pool.connection() as conn:
        async with dict_cursor(conn) as cur:
            await cur.execute(
                """
                SELECT ags_8, bundesland, ort, plz, source, valid_until
                FROM ags_cache_entries
                WHERE query_norm = %s AND valid_until > %s
                """,
                (query_norm, now),
            )
            row = await cur.fetchone()
    if not row:
        return None
    return AGSResolution(
        ags_8=row["ags_8"],
        bundesland=row["bundesland"],
        ort=row["ort"],
        plz=row["plz"],
        source="cache",
        cache_warning=row["source"] == "local_fallback",
    )


async def _cache_put(query_norm: str, resolution: AGSResolution, ttl_days: int) -> None:
    pool = await get_pool()
    valid_until = datetime.now(UTC) + timedelta(days=ttl_days)
    async with pool.connection() as conn:
        async with conn.cursor() as cur:
            await cur.execute(
                """
                INSERT INTO ags_cache_entries
                  (query_norm, ags_8, bundesland, ort, plz, source, valid_until)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (query_norm) DO UPDATE
                  SET ags_8 = EXCLUDED.ags_8,
                      bundesland = EXCLUDED.bundesland,
                      ort = EXCLUDED.ort,
                      plz = EXCLUDED.plz,
                      source = EXCLUDED.source,
                      cached_at = now(),
                      valid_until = EXCLUDED.valid_until
                """,
                (
                    query_norm,
                    resolution.ags_8,
                    resolution.bundesland,
                    resolution.ort,
                    resolution.plz,
                    resolution.source,
                    valid_until,
                ),
            )


# -----------------------------------------------------------------------------
# Public entry point
# -----------------------------------------------------------------------------


async def resolve_ags(address: str, *, skip_cache: bool = False) -> AGSResolution | None:
    """Resolve a free-text German address to an 8-digit AGS code.

    Priority:
      1. Postgres cache (TTL 30 days for BKG, 7 days for local fallback)
      2. Live BKG API (only if BKG_API_KEY is set)
      3. Local PLZ/text fallback (Bayern only)
    """
    query_norm = _normalize_query(address)

    if not skip_cache:
        cached = await _cache_get(query_norm)
        if cached is not None:
            return cached

    live = await _bkg_lookup(address)
    if live is not None:
        await _cache_put(query_norm, live, ttl_days=30)
        return live

    fallback = _local_resolve(address)
    if fallback is not None:
        await _cache_put(query_norm, fallback, ttl_days=7)
        return fallback

    return None
