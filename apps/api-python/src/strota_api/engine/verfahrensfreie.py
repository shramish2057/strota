"""Deterministic Genehmigungsfrei-Pruefer engine.

Reads verfahrensfreie_vorhaben_rules.json from the corpus and evaluates a
user-supplied input against every rule whose project_types match. Returns a
typed Verdict with one of five outcomes plus sonderlage hints.
"""

from __future__ import annotations

from enum import Enum
from typing import Any, Literal

from pydantic import BaseModel, Field, field_validator

from ..corpus import (
    get_bauamt_directory,
    get_special_conditions,
    get_verfahrensfreie_rules,
)


# -----------------------------------------------------------------------------
# Inputs
# -----------------------------------------------------------------------------


class GenehmigungsfreiInput(BaseModel):
    """User-supplied parameters for a Verfahrensfreiheits-Check (Phase 3.5)."""

    bundesland_code: Literal["BY"] = Field(
        ..., description="Phase 4 launch ships Bayern only; other Bundeslaender follow per roadmap."
    )
    ags_8: str = Field(..., min_length=8, max_length=8, description="Gemeinde-AGS 8-stellig.")
    project_type: str = Field(
        ...,
        min_length=2,
        max_length=60,
        description="Vorhabens-Klassifikation aus dem S1-Vorhaben-Katalog.",
    )

    # Maße - alle optional (rule engine prueft pro Regel welche benoetigt werden).
    brutto_grundflaeche_m2: float | None = Field(default=None, ge=0)
    brutto_rauminhalt_m3: float | None = Field(default=None, ge=0)
    mittlere_wandhoehe_m: float | None = Field(default=None, ge=0)
    hoehe_m: float | None = Field(default=None, ge=0)
    hoehe_ueber_dach_m: float | None = Field(default=None, ge=0)
    tiefe_m: float | None = Field(default=None, ge=0)
    gesamtlaenge_m: float | None = Field(default=None, ge=0)
    ansichtsflaeche_m2: float | None = Field(default=None, ge=0)

    # Booleans - default False so missing input wird wie "nicht erfuellt" gewertet.
    im_aussenbereich: bool = False
    hat_aufenthaltsraum: bool = False
    hat_toilette: bool = False
    hat_feuerstaette: bool = False
    ist_an_oder_auf_gebaeude: bool = False
    ist_hochhaus: bool = False
    ist_freistehend: bool = False
    ist_instandhaltung_ohne_eingriff: bool = False
    eingriff_in_tragende_teile: bool = False
    eingriff_in_brandschutz: bool = False
    veraenderung_aussenhuelle: bool = False

    # Sonderlagen (Toggles fuer Hinweisliste, beeinflussen Verdict nur indirekt).
    denkmalschutz: bool = False
    ueberschwemmungsgebiet: bool = False
    naturschutz: bool = False
    sanierungsgebiet: bool = False
    erhaltungssatzung: bool = False
    gestaltungssatzung: bool = False

    @field_validator("ags_8")
    @classmethod
    def _validate_ags_digits(cls, value: str) -> str:
        if not value.isdigit():
            raise ValueError("ags_8 muss 8 Ziffern enthalten.")
        return value


# -----------------------------------------------------------------------------
# Outputs
# -----------------------------------------------------------------------------


class VerdictType(str, Enum):
    """Per bible Surface S1: five outcome verdicts."""

    VERFAHRENSFREI = "verfahrensfrei"
    VERFAHRENSFREI_MIT_ANZEIGE = "verfahrensfrei_mit_anzeige"
    ANTRAG_ERFORDERLICH = "antrag_erforderlich"
    GRENZFALL = "grenzfall"
    SONDERLAGE_TROTZ_VERFAHRENSFREIHEIT = "sonderlage_trotz_verfahrensfreiheit"


class SonderlageHinweis(BaseModel):
    code: str
    name: str
    rechtsgrundlage: str
    konsequenz: str
    zustaendige_behoerde: str | None = None
    anfrage_hinweis: str | None = None


class CitationBlock(BaseModel):
    artikel: int
    absatz: int | None = None
    nummer: int | None = None
    buchstabe: str | None = None
    zitiertext: str
    norm: str = "BayBO"
    quelle_url: str
    effective_from: str
    last_verified_at: str


class Verdict(BaseModel):
    verdict: VerdictType
    title: str
    begruendung: str
    rule_id: str | None = None
    citation: CitationBlock | None = None
    requires_anzeige: bool = False
    anzeige_pflicht_grundlage: str | None = None
    sonderlagen: list[SonderlageHinweis] = Field(default_factory=list)
    bauamt: dict[str, Any] | None = None
    cta: dict[str, str] | None = None
    corpus_version: str
    bundesland_code: Literal["BY"]
    legal_disclaimer: str


# -----------------------------------------------------------------------------
# Internals
# -----------------------------------------------------------------------------


LEGAL_DISCLAIMER = (
    "Diese Einschaetzung beruht auf der aktuellen Bayerischen Bauordnung "
    "(BayBO) und dem Strota-Korpus. Strota ist kein Rechtsdienstleister "
    "iSd RDG; diese Auskunft ersetzt weder Rechtsberatung noch eine "
    "verbindliche Auskunft des Bauaufsichtsamts. Besondere oertliche "
    "Gegebenheiten (Denkmalschutz, Erhaltungs- oder Gestaltungssatzungen, "
    "Bebauungsplan, Sonderschutzgebiete) koennen abweichende Anforderungen "
    "begruenden. Im Zweifel: Bauvoranfrage nach Art. 71 BayBO."
)

OPERATORS = {
    "<=": lambda a, b: a is not None and a <= b,
    "<": lambda a, b: a is not None and a < b,
    ">=": lambda a, b: a is not None and a >= b,
    ">": lambda a, b: a is not None and a > b,
    "==": lambda a, b: a == b,
    "!=": lambda a, b: a != b,
}


def _input_value(payload: GenehmigungsfreiInput, feld: str) -> Any:
    return getattr(payload, feld, None)


def _eval_conditions(
    payload: GenehmigungsfreiInput,
    conditions: list[dict[str, Any]],
) -> tuple[bool, str | None]:
    """Return (all_pass, first_failing_field). All conditions must pass."""
    for cond in conditions:
        feld = cond["feld"]
        op = cond["operator"]
        wert = cond["wert"]
        value = _input_value(payload, feld)
        op_fn = OPERATORS.get(op)
        if op_fn is None:
            return False, feld
        if not op_fn(value, wert):
            return False, feld
    return True, None


def _eval_exclusions(
    payload: GenehmigungsfreiInput,
    exclusions: list[dict[str, Any]],
) -> tuple[bool, dict[str, Any] | None]:
    """Return (is_excluded, exclusion_data). If any exclusion matches, rule is excluded."""
    for exc in exclusions:
        feld = exc["feld"]
        op = exc["operator"]
        wert = exc["wert"]
        op_fn = OPERATORS.get(op)
        if op_fn is None:
            continue
        if op_fn(_input_value(payload, feld), wert):
            return True, exc
    return False, None


def _build_citation(rule: dict[str, Any]) -> CitationBlock | None:
    rg = rule.get("rechtsgrundlage")
    if not rg:
        return None
    return CitationBlock(
        artikel=rg["artikel"],
        absatz=rg.get("absatz"),
        nummer=rg.get("nummer"),
        buchstabe=rg.get("buchstabe"),
        zitiertext=rg["zitiertext"],
        norm="BayBO",
        quelle_url=rule["quelle_url"],
        effective_from=rule["effective_from"],
        last_verified_at=rule["last_verified_at"],
    )


def _active_sonderlagen(
    payload: GenehmigungsfreiInput, rule_triggers: list[str]
) -> list[SonderlageHinweis]:
    if not rule_triggers:
        return []
    catalog = get_special_conditions("BY")
    by_code = {item["code"]: item for item in catalog["sonderlagen"]}
    out: list[SonderlageHinweis] = []
    for trigger in rule_triggers:
        # only emit hint if user marked the corresponding flag true
        flag_value = getattr(payload, trigger, None)
        if flag_value is True:
            entry = by_code.get(trigger)
            if entry is None:
                continue
            out.append(
                SonderlageHinweis(
                    code=entry["code"],
                    name=entry["name"],
                    rechtsgrundlage=entry["rechtsgrundlage"],
                    konsequenz=entry["konsequenz"],
                    zustaendige_behoerde=entry.get("zustaendige_behoerde"),
                    anfrage_hinweis=entry.get("anfrage_hinweis"),
                )
            )
    return out


def _resolve_bauamt(payload: GenehmigungsfreiInput) -> dict[str, Any] | None:
    directory = get_bauamt_directory(payload.bundesland_code)
    prefix5 = payload.ags_8[:5]
    for entry in directory["bauaufsichtsbehoerden"]:
        if entry["ags_kreis"] == prefix5:
            regbez_entry = next(
                (rb for rb in directory["regierungsbezirke"] if rb["code"] == entry["regbez"]),
                None,
            )
            return {
                "ags_kreis": entry["ags_kreis"],
                "name": entry["name"],
                "typ": entry["typ"],
                "regierungsbezirk": regbez_entry["name"] if regbez_entry else entry["regbez"],
            }
    return None


# -----------------------------------------------------------------------------
# Public entry point
# -----------------------------------------------------------------------------


def evaluate_genehmigungsfrei(payload: GenehmigungsfreiInput) -> Verdict:
    """Run the deterministic engine against the corpus and return a Verdict."""
    rules_doc = get_verfahrensfreie_rules(payload.bundesland_code)
    metadata = {
        "corpus_version": _load_corpus_version(payload.bundesland_code),
    }

    # First, check fallback_verdicts - these short-circuit certain project types
    # (Neubau, Wintergarten, Nutzungsaenderung) that are NEVER verfahrensfrei.
    for fallback in rules_doc.get("fallback_verdicts", []):
        if payload.project_type in fallback["project_types"]:
            verdict_type = VerdictType(fallback["verdict"])
            return Verdict(
                verdict=verdict_type,
                title=fallback["id"].replace("_", " ").title(),
                begruendung=fallback["begruendung"],
                rule_id=fallback["id"],
                citation=None,
                requires_anzeige=False,
                sonderlagen=_active_sonderlagen(payload, []),
                bauamt=_resolve_bauamt(payload),
                cta=fallback.get("cta"),
                corpus_version=metadata["corpus_version"],
                bundesland_code=payload.bundesland_code,
                legal_disclaimer=LEGAL_DISCLAIMER,
            )

    # Next, find the most specific verfahrensfreie rule that matches project_type.
    matching_rules = [
        r for r in rules_doc.get("rules", []) if payload.project_type in r["project_types"]
    ]

    if not matching_rules:
        # No rule for this project type means "input unzureichend" - require more info.
        return Verdict(
            verdict=VerdictType.GRENZFALL,
            title="Vorhabens-Typ nicht eindeutig verfahrensfreiheits-katalogisiert",
            begruendung=(
                f"Fuer den Vorhabens-Typ {payload.project_type!r} ist im Strota-Korpus "
                "keine Verfahrensfreiheits-Regel hinterlegt. Bitte legen Sie ein Projekt "
                "an, dann wird die volle Verfahrensbestimmung (Modul 0) durchgefuehrt."
            ),
            rule_id=None,
            citation=None,
            sonderlagen=_active_sonderlagen(payload, []),
            bauamt=_resolve_bauamt(payload),
            cta={
                "label": "Vollstaendige Verfahrensbestimmung starten",
                "href": "/signup",
            },
            corpus_version=metadata["corpus_version"],
            bundesland_code=payload.bundesland_code,
            legal_disclaimer=LEGAL_DISCLAIMER,
        )

    # Evaluate each matching rule. Return the first that fully passes; if any
    # rule is "excluded" (e.g., im_aussenbereich), short-circuit with antrag_erforderlich.
    last_failed_condition: str | None = None
    for rule in matching_rules:
        excluded, exc_data = _eval_exclusions(payload, rule.get("conditions_excluded", []))
        if excluded:
            # Rule says: if THIS condition is true, verdict is forced to antrag_erforderlich
            verdict_override = (
                exc_data.get("verdict_when_excluded") if exc_data else "antrag_erforderlich"
            )
            sonderlagen = _active_sonderlagen(payload, rule.get("sonderlage_trigger", []))
            return Verdict(
                verdict=VerdictType(verdict_override),
                title=rule["title"],
                begruendung=(
                    f"Vorhaben erfuellt grundsaetzlich die Schwellen des "
                    f"{rule['rechtsgrundlage'].get('artikel')} BayBO, ist aber im "
                    f"Aussenbereich oder einer anderen Ausschluss-Konstellation. "
                    "Die Verfahrensfreiheit greift dort nicht."
                ),
                rule_id=rule["id"],
                citation=_build_citation(rule),
                requires_anzeige=False,
                sonderlagen=sonderlagen,
                bauamt=_resolve_bauamt(payload),
                cta={
                    "label": "Vollstaendige Verfahrensbestimmung starten",
                    "href": "/signup",
                },
                corpus_version=metadata["corpus_version"],
                bundesland_code=payload.bundesland_code,
                legal_disclaimer=LEGAL_DISCLAIMER,
            )

        passes, first_fail = _eval_conditions(payload, rule.get("conditions_all", []))
        if not passes:
            last_failed_condition = first_fail
            continue

        # Rule fully matches.
        sonderlagen = _active_sonderlagen(payload, rule.get("sonderlage_trigger", []))
        verdict_type = (
            VerdictType.SONDERLAGE_TROTZ_VERFAHRENSFREIHEIT
            if sonderlagen
            else (
                VerdictType.VERFAHRENSFREI_MIT_ANZEIGE
                if rule.get("requires_anzeige")
                else VerdictType.VERFAHRENSFREI
            )
        )
        return Verdict(
            verdict=verdict_type,
            title=rule["title"],
            begruendung=(
                "Alle Schwellenwerte sind eingehalten. Das Vorhaben ist nach dem hinterlegten "
                "Tatbestand verfahrensfrei. "
                + (
                    "Es greifen jedoch eine oder mehrere Sonderlagen, die separate Erlaubnisse erfordern."
                    if sonderlagen
                    else ""
                )
            ).strip(),
            rule_id=rule["id"],
            citation=_build_citation(rule),
            requires_anzeige=bool(rule.get("requires_anzeige")),
            anzeige_pflicht_grundlage=rule.get("anzeige_pflicht_grundlage"),
            sonderlagen=sonderlagen,
            bauamt=_resolve_bauamt(payload),
            cta={
                "label": "Vollstaendige Unterlagenliste erstellen",
                "href": "/signup",
            },
            corpus_version=metadata["corpus_version"],
            bundesland_code=payload.bundesland_code,
            legal_disclaimer=LEGAL_DISCLAIMER,
        )

    # No matching rule passed all conditions. Grenzfall.
    return Verdict(
        verdict=VerdictType.GRENZFALL,
        title="Schwellenwerte nicht erfuellt - Grenzfall",
        begruendung=(
            f"Mindestens ein Schwellenwert wird nicht erfuellt "
            f"({last_failed_condition or 'unbekannt'}). Das Vorhaben ueberschreitet die "
            "Verfahrensfreiheit nach Art. 57 BayBO. Eine Bauvoranfrage nach Art. 71 BayBO "
            "wird empfohlen, oder Sie legen ein vollstaendiges Projekt mit Strota an."
        ),
        rule_id=None,
        citation=None,
        sonderlagen=_active_sonderlagen(payload, []),
        bauamt=_resolve_bauamt(payload),
        cta={
            "label": "Vollstaendige Verfahrensbestimmung starten",
            "href": "/signup",
        },
        corpus_version=metadata["corpus_version"],
        bundesland_code=payload.bundesland_code,
        legal_disclaimer=LEGAL_DISCLAIMER,
    )


def _load_corpus_version(land_code: str) -> str:
    from ..corpus import get_metadata

    meta = get_metadata(land_code)
    return str(meta.get("corpus_version", "unknown"))
