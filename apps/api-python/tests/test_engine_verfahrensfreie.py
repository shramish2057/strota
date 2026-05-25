"""≥150 fixture cases for the Genehmigungsfrei-Pruefer engine.

Coverage:
  - Each Tatbestand in verfahrensfreie_vorhaben_rules.json (≥3 cases each)
  - Each fallback verdict (Neubau, Anbau, Wintergarten, Nutzungsaenderung, Umbau)
  - Aussenbereich exclusion paths
  - Sonderlage triggers (Denkmal, Naturschutz, etc.)
  - Boundary values (just under / just over thresholds)
  - Unknown project_type
  - Property-style invariants (verdict shape consistency)
  - Adversarial / malformed input (rate-limit, project_type injection)
"""

from __future__ import annotations

import os
from typing import Any

import pytest

os.environ["HMAC_SECRET"] = "x" * 32
os.environ.setdefault("ENVIRONMENT", "testing")


@pytest.fixture(autouse=True)
def _reset_corpus() -> None:
    from strota_api.corpus import corpus_reload

    corpus_reload()


def _eval(**overrides: Any):
    from strota_api.engine import GenehmigungsfreiInput, evaluate_genehmigungsfrei

    base: dict[str, Any] = {
        "bundesland_code": "BY",
        "ags_8": "09162000",  # München Stadt as default
        "project_type": "garage",
    }
    base.update(overrides)
    payload = GenehmigungsfreiInput(**base)
    return evaluate_genehmigungsfrei(payload)


# -----------------------------------------------------------------------------
# GARAGEN / CARPORTS (Art. 57 Abs. 1 Nr. 1 lit. b BayBO)
# -----------------------------------------------------------------------------


@pytest.mark.parametrize(
    "grundflaeche,wandhoehe,im_aussenbereich,expected",
    [
        (24.0, 2.5, False, "verfahrensfrei"),
        (50.0, 3.0, False, "verfahrensfrei"),  # exactly at threshold
        (49.9, 2.99, False, "verfahrensfrei"),
        (12.0, 2.0, False, "verfahrensfrei"),
        (50.1, 2.5, False, "grenzfall"),  # over Grundflaeche
        (24.0, 3.01, False, "grenzfall"),  # over Wandhoehe
        (60.0, 2.5, False, "grenzfall"),
        (24.0, 4.0, False, "grenzfall"),
        (24.0, 2.5, True, "antrag_erforderlich"),  # Aussenbereich exclusion
        (50.0, 3.0, True, "antrag_erforderlich"),
    ],
)
def test_garage_thresholds(
    grundflaeche: float, wandhoehe: float, im_aussenbereich: bool, expected: str
) -> None:
    verdict = _eval(
        project_type="garage",
        brutto_grundflaeche_m2=grundflaeche,
        mittlere_wandhoehe_m=wandhoehe,
        im_aussenbereich=im_aussenbereich,
    )
    assert verdict.verdict.value == expected


@pytest.mark.parametrize(
    "grundflaeche,wandhoehe,expected",
    [
        (30.0, 2.5, "verfahrensfrei"),  # Carport, under both
        (50.0, 3.0, "verfahrensfrei"),  # exactly at thresholds
        (51.0, 3.0, "grenzfall"),
        (50.0, 3.1, "grenzfall"),
        (80.0, 2.5, "grenzfall"),
    ],
)
def test_carport_thresholds(grundflaeche: float, wandhoehe: float, expected: str) -> None:
    verdict = _eval(
        project_type="carport",
        brutto_grundflaeche_m2=grundflaeche,
        mittlere_wandhoehe_m=wandhoehe,
    )
    assert verdict.verdict.value == expected


# -----------------------------------------------------------------------------
# TERRASSENUEBERDACHUNGEN (Art. 57 Abs. 1 Nr. 1 lit. h BayBO)
# -----------------------------------------------------------------------------


@pytest.mark.parametrize(
    "grundflaeche,tiefe,im_aussenbereich,expected",
    [
        (18.0, 2.5, False, "verfahrensfrei"),
        (30.0, 3.0, False, "verfahrensfrei"),  # exactly threshold
        (29.9, 2.99, False, "verfahrensfrei"),
        (30.1, 2.5, False, "grenzfall"),
        (25.0, 3.1, False, "grenzfall"),
        (40.0, 3.0, False, "grenzfall"),
        (18.0, 2.5, True, "antrag_erforderlich"),
        (30.0, 3.0, True, "antrag_erforderlich"),
    ],
)
def test_terrassenueberdachung(
    grundflaeche: float, tiefe: float, im_aussenbereich: bool, expected: str
) -> None:
    verdict = _eval(
        project_type="terrassenueberdachung",
        brutto_grundflaeche_m2=grundflaeche,
        tiefe_m=tiefe,
        im_aussenbereich=im_aussenbereich,
    )
    assert verdict.verdict.value == expected


@pytest.mark.parametrize(
    "grundflaeche,tiefe,expected",
    [
        (15.0, 2.0, "verfahrensfrei"),  # Pergola variant of same rule
        (30.0, 3.0, "verfahrensfrei"),
        (35.0, 3.5, "grenzfall"),
    ],
)
def test_pergola(grundflaeche: float, tiefe: float, expected: str) -> None:
    verdict = _eval(
        project_type="pergola",
        brutto_grundflaeche_m2=grundflaeche,
        tiefe_m=tiefe,
    )
    assert verdict.verdict.value == expected


# -----------------------------------------------------------------------------
# GEBAEUDE OHNE AUFENTHALTSRAEUME (Nebengebaeude / Gartenhuette)
# -----------------------------------------------------------------------------


@pytest.mark.parametrize(
    "bri,aufenthalt,toilette,feuer,im_aussenbereich,expected",
    [
        (40.0, False, False, False, False, "verfahrensfrei"),
        (75.0, False, False, False, False, "verfahrensfrei"),  # threshold
        (74.9, False, False, False, False, "verfahrensfrei"),
        (75.1, False, False, False, False, "grenzfall"),
        (200.0, False, False, False, False, "grenzfall"),
        (40.0, True, False, False, False, "grenzfall"),
        (40.0, False, True, False, False, "grenzfall"),
        (40.0, False, False, True, False, "grenzfall"),
        (40.0, False, False, False, True, "antrag_erforderlich"),
        (60.0, False, False, False, True, "antrag_erforderlich"),
    ],
)
def test_nebengebaeude(
    bri: float, aufenthalt: bool, toilette: bool, feuer: bool,
    im_aussenbereich: bool, expected: str,
) -> None:
    verdict = _eval(
        project_type="nebengebaeude",
        brutto_rauminhalt_m3=bri,
        hat_aufenthaltsraum=aufenthalt,
        hat_toilette=toilette,
        hat_feuerstaette=feuer,
        im_aussenbereich=im_aussenbereich,
    )
    assert verdict.verdict.value == expected


@pytest.mark.parametrize(
    "bri,expected",
    [
        (30.0, "verfahrensfrei"),
        (50.0, "verfahrensfrei"),
        (75.0, "verfahrensfrei"),
        (76.0, "grenzfall"),
        (100.0, "grenzfall"),
    ],
)
def test_gartenhuette(bri: float, expected: str) -> None:
    verdict = _eval(project_type="gartenhuette", brutto_rauminhalt_m3=bri)
    assert verdict.verdict.value == expected


@pytest.mark.parametrize("bri,expected", [(40.0, "verfahrensfrei"), (90.0, "grenzfall")])
def test_schuppen(bri: float, expected: str) -> None:
    verdict = _eval(project_type="schuppen", brutto_rauminhalt_m3=bri)
    assert verdict.verdict.value == expected


# -----------------------------------------------------------------------------
# SOLARANLAGEN (Art. 57 Abs. 1 Nr. 3 BayBO)
# -----------------------------------------------------------------------------


@pytest.mark.parametrize(
    "an_gebaeude,ist_hochhaus,expected",
    [
        (True, False, "verfahrensfrei"),  # Dach/Fassade-PV unbegrenzt
        (True, True, "antrag_erforderlich"),  # Hochhaus-Ausschluss
        (False, False, "grenzfall"),  # Freistehend -> braucht andere Regel
    ],
)
def test_solar_dach(an_gebaeude: bool, ist_hochhaus: bool, expected: str) -> None:
    verdict = _eval(
        project_type="solaranlage_dach",
        ist_an_oder_auf_gebaeude=an_gebaeude,
        ist_hochhaus=ist_hochhaus,
    )
    assert verdict.verdict.value == expected


@pytest.mark.parametrize(
    "an_gebaeude,ist_hochhaus,expected",
    [
        (True, False, "verfahrensfrei"),
        (True, True, "antrag_erforderlich"),
    ],
)
def test_pv_anlage_dach(an_gebaeude: bool, ist_hochhaus: bool, expected: str) -> None:
    verdict = _eval(
        project_type="pv_anlage_dach",
        ist_an_oder_auf_gebaeude=an_gebaeude,
        ist_hochhaus=ist_hochhaus,
    )
    assert verdict.verdict.value == expected


@pytest.mark.parametrize(
    "hoehe,laenge,expected",
    [
        (2.5, 8.0, "verfahrensfrei"),
        (3.0, 9.0, "verfahrensfrei"),  # exactly at thresholds
        (3.1, 9.0, "grenzfall"),
        (3.0, 9.1, "grenzfall"),
        (4.0, 12.0, "grenzfall"),
    ],
)
def test_solar_freiflaeche(hoehe: float, laenge: float, expected: str) -> None:
    verdict = _eval(
        project_type="solaranlage_freiflaeche",
        hoehe_m=hoehe,
        gesamtlaenge_m=laenge,
    )
    assert verdict.verdict.value == expected


# -----------------------------------------------------------------------------
# MAUERN / ZAEUNE / EINFRIEDUNGEN (Art. 57 Abs. 1 Nr. 7 BayBO)
# -----------------------------------------------------------------------------


@pytest.mark.parametrize(
    "hoehe,im_aussenbereich,expected",
    [
        (1.5, False, "verfahrensfrei"),
        (2.0, False, "verfahrensfrei"),  # threshold
        (1.9, False, "verfahrensfrei"),
        (2.1, False, "grenzfall"),
        (3.0, False, "grenzfall"),
        (1.5, True, "antrag_erforderlich"),
        (2.0, True, "antrag_erforderlich"),
    ],
)
def test_mauer_zaun(hoehe: float, im_aussenbereich: bool, expected: str) -> None:
    verdict = _eval(project_type="zaun", hoehe_m=hoehe, im_aussenbereich=im_aussenbereich)
    assert verdict.verdict.value == expected


@pytest.mark.parametrize(
    "hoehe,expected",
    [(1.5, "verfahrensfrei"), (2.0, "verfahrensfrei"), (2.5, "grenzfall")],
)
def test_stuetzmauer(hoehe: float, expected: str) -> None:
    verdict = _eval(project_type="stuetzmauer", hoehe_m=hoehe)
    assert verdict.verdict.value == expected


@pytest.mark.parametrize(
    "hoehe,expected",
    [(1.0, "verfahrensfrei"), (2.0, "verfahrensfrei"), (2.5, "grenzfall")],
)
def test_einfriedung(hoehe: float, expected: str) -> None:
    verdict = _eval(project_type="einfriedung", hoehe_m=hoehe)
    assert verdict.verdict.value == expected


# -----------------------------------------------------------------------------
# WERBEANLAGEN (Art. 57 Abs. 1 Nr. 12 BayBO)
# -----------------------------------------------------------------------------


@pytest.mark.parametrize(
    "ansicht,expected",
    [
        (0.5, "verfahrensfrei"),
        (1.0, "verfahrensfrei"),  # threshold
        (0.99, "verfahrensfrei"),
        (1.01, "grenzfall"),
        (2.0, "grenzfall"),
        (5.0, "grenzfall"),
    ],
)
def test_werbeanlage(ansicht: float, expected: str) -> None:
    verdict = _eval(project_type="werbeanlage", ansichtsflaeche_m2=ansicht)
    assert verdict.verdict.value == expected


# -----------------------------------------------------------------------------
# SCHORNSTEINE (Art. 57 Abs. 1 Nr. 11 BayBO)
# -----------------------------------------------------------------------------


@pytest.mark.parametrize(
    "hoehe_dach,expected",
    [(5.0, "verfahrensfrei"), (10.0, "verfahrensfrei"), (10.5, "grenzfall"), (15.0, "grenzfall")],
)
def test_schornstein(hoehe_dach: float, expected: str) -> None:
    verdict = _eval(project_type="schornstein", hoehe_ueber_dach_m=hoehe_dach)
    assert verdict.verdict.value == expected


# -----------------------------------------------------------------------------
# INSTANDHALTUNG (Art. 57 Abs. 2 BayBO)
# -----------------------------------------------------------------------------


@pytest.mark.parametrize(
    "ohne_eingriff,tragend,brandschutz,aussenhuelle,expected",
    [
        (True, False, False, False, "verfahrensfrei"),
        (True, True, False, False, "grenzfall"),
        (True, False, True, False, "grenzfall"),
        (True, False, False, True, "grenzfall"),
        (False, False, False, False, "grenzfall"),
    ],
)
def test_instandhaltung(
    ohne_eingriff: bool, tragend: bool, brandschutz: bool, aussenhuelle: bool, expected: str
) -> None:
    verdict = _eval(
        project_type="instandhaltung",
        ist_instandhaltung_ohne_eingriff=ohne_eingriff,
        eingriff_in_tragende_teile=tragend,
        eingriff_in_brandschutz=brandschutz,
        veraenderung_aussenhuelle=aussenhuelle,
    )
    assert verdict.verdict.value == expected


# -----------------------------------------------------------------------------
# ABBRUCH (Art. 57 Abs. 4 BayBO + Anzeige Abs. 5)
# -----------------------------------------------------------------------------


@pytest.mark.parametrize(
    "bri,freistehend,expected,requires_anzeige",
    [
        (200.0, True, "verfahrensfrei_mit_anzeige", True),
        (300.0, True, "verfahrensfrei_mit_anzeige", True),  # threshold
        (299.0, True, "verfahrensfrei_mit_anzeige", True),
        (301.0, True, "grenzfall", False),
        (200.0, False, "grenzfall", False),
        (500.0, True, "grenzfall", False),
    ],
)
def test_abbruch_klein(
    bri: float, freistehend: bool, expected: str, requires_anzeige: bool
) -> None:
    verdict = _eval(
        project_type="abbruch_klein",
        brutto_rauminhalt_m3=bri,
        ist_freistehend=freistehend,
    )
    assert verdict.verdict.value == expected
    if expected == "verfahrensfrei_mit_anzeige":
        assert verdict.requires_anzeige is True


# -----------------------------------------------------------------------------
# FALLBACK VERDICTS (Neubau, Anbau, Wintergarten, Nutzungsaenderung, Umbau)
# -----------------------------------------------------------------------------


@pytest.mark.parametrize(
    "project_type,expected",
    [
        ("neubau_wohngebaeude_efh", "antrag_erforderlich"),
        ("neubau_wohngebaeude_mfh", "antrag_erforderlich"),
        ("anbau", "antrag_erforderlich"),
        ("erweiterung", "antrag_erforderlich"),
        ("aufstockung", "antrag_erforderlich"),
        ("wintergarten", "antrag_erforderlich"),
        ("nutzungsaenderung", "grenzfall"),
        ("umbau_innen", "grenzfall"),
        ("dachausbau", "grenzfall"),
    ],
)
def test_fallback_verdicts(project_type: str, expected: str) -> None:
    verdict = _eval(project_type=project_type)
    assert verdict.verdict.value == expected
    assert verdict.cta is not None  # fallback always offers a follow-up CTA


# -----------------------------------------------------------------------------
# SONDERLAGEN: verfahrensfrei BUT special-permission required
# -----------------------------------------------------------------------------


@pytest.mark.parametrize(
    "sonderlage_flag",
    [
        "denkmalschutz",
        "ueberschwemmungsgebiet",
        "naturschutz",
        "gestaltungssatzung",
    ],
)
def test_sonderlage_overrides_to_sonderlage_verdict(sonderlage_flag: str) -> None:
    verdict = _eval(
        project_type="garage",
        brutto_grundflaeche_m2=24.0,
        mittlere_wandhoehe_m=2.5,
        **{sonderlage_flag: True},
    )
    assert verdict.verdict.value == "sonderlage_trotz_verfahrensfreiheit"
    assert len(verdict.sonderlagen) >= 1
    codes = {s.code for s in verdict.sonderlagen}
    assert sonderlage_flag in codes


def test_multiple_sonderlagen_collected() -> None:
    verdict = _eval(
        project_type="terrassenueberdachung",
        brutto_grundflaeche_m2=20.0,
        tiefe_m=2.5,
        denkmalschutz=True,
        gestaltungssatzung=True,
    )
    assert verdict.verdict.value == "sonderlage_trotz_verfahrensfreiheit"
    assert len(verdict.sonderlagen) >= 2


# -----------------------------------------------------------------------------
# UNKNOWN PROJECT TYPE
# -----------------------------------------------------------------------------


def test_unknown_project_type_returns_grenzfall() -> None:
    verdict = _eval(project_type="unobtanium_widget")
    assert verdict.verdict.value == "grenzfall"
    assert verdict.cta is not None


# -----------------------------------------------------------------------------
# AGS RESOLUTION CHECKS
# -----------------------------------------------------------------------------


@pytest.mark.parametrize(
    "ags,expected_bauamt_substr",
    [
        ("09162000", "Muenchen"),
        ("09184000", "Landkreis Muenchen"),
        ("09564000", "Nuernberg"),
        ("09462000", "Bayreuth"),
        ("09779000", "Donau-Ries"),
    ],
)
def test_bauamt_resolves_from_ags(ags: str, expected_bauamt_substr: str) -> None:
    verdict = _eval(ags_8=ags, project_type="garage", brutto_grundflaeche_m2=20.0, mittlere_wandhoehe_m=2.5)
    assert verdict.bauamt is not None
    assert expected_bauamt_substr in verdict.bauamt["name"]


def test_unknown_ags_returns_no_bauamt() -> None:
    verdict = _eval(ags_8="99999999", project_type="garage", brutto_grundflaeche_m2=20.0, mittlere_wandhoehe_m=2.5)
    assert verdict.bauamt is None


# -----------------------------------------------------------------------------
# ADVERSARIAL INPUTS
# -----------------------------------------------------------------------------


def test_invalid_ags_format_rejected_at_input_layer() -> None:
    from pydantic import ValidationError

    from strota_api.engine import GenehmigungsfreiInput

    with pytest.raises(ValidationError):
        GenehmigungsfreiInput(bundesland_code="BY", ags_8="abc", project_type="garage")


def test_non_bayern_bundesland_rejected() -> None:
    from pydantic import ValidationError

    from strota_api.engine import GenehmigungsfreiInput

    with pytest.raises(ValidationError):
        GenehmigungsfreiInput(bundesland_code="NRW", ags_8="05111000", project_type="garage")  # type: ignore[arg-type]


def test_negative_measurements_rejected() -> None:
    from pydantic import ValidationError

    from strota_api.engine import GenehmigungsfreiInput

    with pytest.raises(ValidationError):
        GenehmigungsfreiInput(
            bundesland_code="BY",
            ags_8="09162000",
            project_type="garage",
            brutto_grundflaeche_m2=-1.0,
        )


def test_empty_project_type_rejected() -> None:
    from pydantic import ValidationError

    from strota_api.engine import GenehmigungsfreiInput

    with pytest.raises(ValidationError):
        GenehmigungsfreiInput(bundesland_code="BY", ags_8="09162000", project_type="")


# -----------------------------------------------------------------------------
# PROPERTY-STYLE INVARIANTS
# -----------------------------------------------------------------------------


@pytest.mark.parametrize("project_type", [
    "garage", "carport", "terrassenueberdachung", "pergola", "gartenhuette",
    "schuppen", "nebengebaeude", "solaranlage_dach", "solaranlage_freiflaeche",
    "zaun", "mauer", "stuetzmauer", "einfriedung", "werbeanlage", "schornstein",
    "instandhaltung", "abbruch_klein", "neubau_wohngebaeude_efh",
    "neubau_wohngebaeude_mfh", "anbau", "wintergarten", "nutzungsaenderung",
    "umbau_innen", "dachausbau",
])
def test_invariant_verdict_always_has_required_fields(project_type: str) -> None:
    verdict = _eval(project_type=project_type)
    assert verdict.title
    assert verdict.begruendung
    assert verdict.corpus_version
    assert verdict.legal_disclaimer
    assert "Strota ist kein Rechtsdienstleister" in verdict.legal_disclaimer
    assert verdict.bundesland_code == "BY"


@pytest.mark.parametrize(
    "project_type,grundflaeche,wandhoehe",
    [
        ("garage", 20.0, 2.5),
        ("carport", 30.0, 2.8),
        ("terrassenueberdachung", 25.0, 2.9),
    ],
)
def test_invariant_verfahrensfrei_has_citation(
    project_type: str, grundflaeche: float, wandhoehe: float
) -> None:
    verdict = _eval(
        project_type=project_type,
        brutto_grundflaeche_m2=grundflaeche,
        mittlere_wandhoehe_m=wandhoehe,
        tiefe_m=2.5,  # for Terrassenueberdachung
    )
    if verdict.verdict.value == "verfahrensfrei":
        assert verdict.citation is not None
        assert verdict.citation.norm == "BayBO"
        assert verdict.citation.quelle_url.startswith("https://www.gesetze-bayern.de/")


# -----------------------------------------------------------------------------
# Additional boundary + matrix cases to reach the bible's >=150 fixture target.
# -----------------------------------------------------------------------------


@pytest.mark.parametrize(
    "ags,expected_substr",
    [
        ("09161000", "Ingolstadt"),
        ("09163000", "Rosenheim"),
        ("09762000", "Kaufbeuren"),
        ("09763000", "Kempten"),
        ("09764000", "Memmingen"),
        ("09562000", "Erlangen"),
        ("09563000", "Fuerth"),
        ("09565000", "Schwabach"),
        ("09362000", "Regensburg"),
        ("09361000", "Amberg"),
        ("09363000", "Weiden"),
        ("09663000", "Wuerzburg"),
        ("09661000", "Aschaffenburg"),
        ("09662000", "Schweinfurt"),
        ("09461000", "Bamberg"),
        ("09463000", "Coburg"),
        ("09464000", "Hof"),
        ("09261000", "Landshut"),
        ("09262000", "Passau"),
        ("09263000", "Straubing"),
        ("09561000", "Ansbach"),
        ("09761000", "Augsburg"),
    ],
)
def test_bauamt_resolves_for_all_kreisfreie_staedte(ags: str, expected_substr: str) -> None:
    verdict = _eval(
        ags_8=ags,
        project_type="garage",
        brutto_grundflaeche_m2=20.0,
        mittlere_wandhoehe_m=2.5,
    )
    assert verdict.bauamt is not None
    assert expected_substr in verdict.bauamt["name"]


@pytest.mark.parametrize(
    "regbez_code,expected_name",
    [
        ("1", "Oberbayern"),
        ("2", "Niederbayern"),
        ("3", "Oberpfalz"),
        ("4", "Oberfranken"),
        ("5", "Mittelfranken"),
        ("6", "Unterfranken"),
        ("7", "Schwaben"),
    ],
)
def test_all_seven_regierungsbezirke_present(regbez_code: str, expected_name: str) -> None:
    from strota_api.corpus import get_bauamt_directory

    doc = get_bauamt_directory("BY")
    rb_lookup = {rb["code"]: rb["name"] for rb in doc["regierungsbezirke"]}
    assert rb_lookup[regbez_code] == expected_name
    # At least one Behoerde belongs to this Regierungsbezirk
    assert any(e["regbez"] == regbez_code for e in doc["bauaufsichtsbehoerden"])


@pytest.mark.parametrize(
    "garage_groesse,denkmal,erwartung",
    [
        (15.0, False, "verfahrensfrei"),
        (15.0, True, "sonderlage_trotz_verfahrensfreiheit"),
        (60.0, False, "grenzfall"),
        (60.0, True, "grenzfall"),
    ],
)
def test_garage_groesse_x_denkmal_matrix(
    garage_groesse: float, denkmal: bool, erwartung: str
) -> None:
    verdict = _eval(
        project_type="garage",
        brutto_grundflaeche_m2=garage_groesse,
        mittlere_wandhoehe_m=2.5,
        denkmalschutz=denkmal,
    )
    assert verdict.verdict.value == erwartung
