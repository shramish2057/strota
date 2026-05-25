"""Verify all Bayern corpus JSON files load and conform to expected shape."""

from __future__ import annotations

import os

import pytest

os.environ["HMAC_SECRET"] = "x" * 32
os.environ.setdefault("ENVIRONMENT", "testing")


@pytest.fixture(autouse=True)
def _reset_corpus() -> None:
    from strota_api.corpus import corpus_reload

    corpus_reload()


def test_metadata_has_required_fields() -> None:
    from strota_api.corpus import get_metadata

    meta = get_metadata("BY")
    assert meta["bundesland_code"] == "BY"
    assert meta["bundesland_name"] == "Bayern"
    assert meta["corpus_version"]
    assert len(meta["primary_sources"]) >= 3
    for src in meta["primary_sources"]:
        assert src["lizenz_status"] == "public_domain"
        assert src["quelle_url"].startswith("https://")


def test_verfahrensfreie_rules_have_minimum_count_and_shape() -> None:
    from strota_api.corpus import get_verfahrensfreie_rules

    doc = get_verfahrensfreie_rules("BY")
    rules = doc["rules"]
    fallback = doc["fallback_verdicts"]
    assert len(rules) >= 8, "expected at least 8 Verfahrensfreiheits-Tatbestaende"
    assert len(fallback) >= 5, "expected at least 5 fallback verdicts (Neubau, Anbau etc.)"
    for r in rules:
        assert r["id"].startswith("by-")
        assert r["project_types"], "every rule must list at least one project_type"
        assert r["rechtsgrundlage"]["artikel"] == 57
        assert r["rechtsgrundlage"]["zitiertext"]
        assert r["quelle_url"].startswith("https://www.gesetze-bayern.de/")
        assert r["effective_from"]
        assert r["last_verified_at"]
    project_types_covered = {pt for r in rules for pt in r["project_types"]} | {
        pt for f in fallback for pt in f["project_types"]
    }
    # Bible top-5 must all be addressed
    for pt in ("garage", "carport", "terrassenueberdachung", "gartenhuette", "solaranlage_dach"):
        assert pt in project_types_covered, f"top-5 project type missing: {pt}"


def test_verfahrensart_rules_cover_all_ten_verfahrensarten() -> None:
    from strota_api.corpus import get_verfahrensart_rules

    doc = get_verfahrensart_rules("BY")
    codes = {v["code"] for v in doc["verfahrensarten"]}
    expected = {
        "verfahrensfrei",
        "verfahrensfrei_anzeige",
        "freistellung",
        "vereinfacht",
        "genehmigung",
        "sonderbau",
        "abweichung_isoliert",
        "nachgenehmigung",
    }
    missing = expected - codes
    assert not missing, f"Verfahrensart-Korpus missing: {missing}"


def test_gebaeudeklassen_have_gk1_to_gk5_plus_sonderbau() -> None:
    from strota_api.corpus import get_gebaeudeklassen

    doc = get_gebaeudeklassen("BY")
    codes = {gk["code"] for gk in doc["klassen"]}
    assert {"GK1", "GK2", "GK3", "GK4", "GK5", "Sonderbau"}.issubset(codes)


def test_sonderbau_katalog_has_twenty_entries() -> None:
    from strota_api.corpus import get_sonderbau_katalog

    doc = get_sonderbau_katalog("BY")
    nrs = sorted(entry["nr"] for entry in doc["katalog"])
    assert nrs == list(range(1, 21)), f"Sonderbau-Katalog must be Nrn 1..20, got {nrs}"


def test_bauamt_directory_covers_all_71_landkreise_and_25_kreisfreie_staedte() -> None:
    from strota_api.corpus import get_bauamt_directory

    doc = get_bauamt_directory("BY")
    entries = doc["bauaufsichtsbehoerden"]
    kreisfrei = [e for e in entries if e["typ"] == "kreisfreie_stadt"]
    landkreise = [e for e in entries if e["typ"] == "landratsamt"]
    assert len(kreisfrei) == 25, f"Bayern hat 25 kreisfreie Staedte, gefunden {len(kreisfrei)}"
    assert len(landkreise) == 71, f"Bayern hat 71 Landkreise, gefunden {len(landkreise)}"
    # AGS uniqueness
    ags_kreise = [e["ags_kreis"] for e in entries]
    assert len(ags_kreise) == len(set(ags_kreise)), "AGS-Kreis-Codes must be unique"
    # All start with 09 (Bayern Bundesland-Code)
    assert all(a.startswith("09") for a in ags_kreise)


def test_special_conditions_have_required_fields() -> None:
    from strota_api.corpus import get_special_conditions

    doc = get_special_conditions("BY")
    for s in doc["sonderlagen"]:
        assert s["code"]
        assert s["name"]
        assert s["rechtsgrundlage"]
        assert s["konsequenz"]
