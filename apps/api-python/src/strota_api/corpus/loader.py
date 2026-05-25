"""JSON file loader for the Strota regulatory corpus.

The corpus directory lives outside the Python package (repo root /corpus). The
location is resolved via config.corpus_dir; we accept either an absolute path
or a path relative to the api-python package root.

All loaded files are cached for the process lifetime. CI tests can force a
reload via corpus_reload().
"""

from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path
from typing import Any

from ..config import get_settings


def _resolve_corpus_root() -> Path:
    settings = get_settings()
    p = Path(settings.corpus_dir)
    if p.is_absolute():
        return p
    # Resolve relative to the api-python package root (one directory above
    # the strota_api package).
    here = Path(__file__).resolve().parent.parent.parent.parent
    return (here / p).resolve()


def _bavaria_dir() -> Path:
    return _resolve_corpus_root() / "bundeslaender" / "bavaria"


def _load_json(path: Path) -> Any:
    with path.open("r", encoding="utf-8") as fh:
        return json.load(fh)


@lru_cache(maxsize=8)
def get_metadata(land_code: str = "BY") -> dict[str, Any]:
    if land_code != "BY":
        raise ValueError(f"Corpus for {land_code!r} not yet available. Bayern only at Phase 4 launch.")
    return _load_json(_bavaria_dir() / "metadata.json")


@lru_cache(maxsize=8)
def get_verfahrensfreie_rules(land_code: str = "BY") -> dict[str, Any]:
    if land_code != "BY":
        raise ValueError(f"Verfahrensfreie-Regeln fuer {land_code!r} noch nicht verfuegbar.")
    return _load_json(_bavaria_dir() / "verfahrensfreie_vorhaben_rules.json")


@lru_cache(maxsize=8)
def get_verfahrensart_rules(land_code: str = "BY") -> dict[str, Any]:
    if land_code != "BY":
        raise ValueError(f"Verfahrensart-Regeln fuer {land_code!r} noch nicht verfuegbar.")
    return _load_json(_bavaria_dir() / "verfahrensart_rules.json")


@lru_cache(maxsize=8)
def get_gebaeudeklassen(land_code: str = "BY") -> dict[str, Any]:
    if land_code != "BY":
        raise ValueError(f"Gebaeudeklassen-Korpus fuer {land_code!r} fehlt.")
    return _load_json(_bavaria_dir() / "gebaeudeklassen.json")


@lru_cache(maxsize=8)
def get_sonderbau_katalog(land_code: str = "BY") -> dict[str, Any]:
    if land_code != "BY":
        raise ValueError(f"Sonderbau-Katalog fuer {land_code!r} fehlt.")
    return _load_json(_bavaria_dir() / "sonderbau_katalog.json")


@lru_cache(maxsize=8)
def get_bauamt_directory(land_code: str = "BY") -> dict[str, Any]:
    if land_code != "BY":
        raise ValueError(f"Bauamt-Directory fuer {land_code!r} fehlt.")
    return _load_json(_bavaria_dir() / "bauamt_directory.json")


@lru_cache(maxsize=8)
def get_special_conditions(land_code: str = "BY") -> dict[str, Any]:
    if land_code != "BY":
        raise ValueError(f"Sonderlagen-Korpus fuer {land_code!r} fehlt.")
    return _load_json(_bavaria_dir() / "special_conditions.json")


def corpus_reload() -> None:
    """Clear all caches so the next access reads from disk again."""
    get_metadata.cache_clear()
    get_verfahrensfreie_rules.cache_clear()
    get_verfahrensart_rules.cache_clear()
    get_gebaeudeklassen.cache_clear()
    get_sonderbau_katalog.cache_clear()
    get_bauamt_directory.cache_clear()
    get_special_conditions.cache_clear()
