"""Strota Regulatory Corpus loader.

Loads JSON files from the corpus directory (see config.corpus_dir) into typed,
in-memory Pydantic models. Cached for the process lifetime; reloaded only on
explicit `corpus_reload()` call (used by CI tests).
"""

from .loader import (
    corpus_reload,
    get_bauamt_directory,
    get_gebaeudeklassen,
    get_metadata,
    get_sonderbau_katalog,
    get_special_conditions,
    get_verfahrensart_rules,
    get_verfahrensfreie_rules,
)

__all__ = [
    "corpus_reload",
    "get_bauamt_directory",
    "get_gebaeudeklassen",
    "get_metadata",
    "get_sonderbau_katalog",
    "get_special_conditions",
    "get_verfahrensart_rules",
    "get_verfahrensfreie_rules",
]
