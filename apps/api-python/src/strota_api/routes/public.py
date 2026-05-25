"""Public unauthenticated routes for Phase 3.5 Surface S1.

Endpoints:
  POST /api/public/genehmigungsfrei/check
    Body: GenehmigungsfreiCheckRequest (address + project_type + params + sonderlagen).
    Resolves AGS via BKG client or fallback, applies the deterministic rule
    engine, returns Verdict. IP-hash rate limited at 10/day.

  GET /api/public/genehmigungsfrei/project-types
    Returns the catalog of project types the engine knows.

  GET /api/public/genehmigungsfrei/health
    Returns corpus version + AGS resolution mode (live vs fallback).

  POST /api/public/grz-rechner
    Stateless GRZ/GFZ/BMZ calculator.
"""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, HTTPException, Request, status
from pydantic import BaseModel, Field, field_validator

from ..config import get_settings
from ..corpus import get_metadata, get_verfahrensfreie_rules
from ..engine import (
    GenehmigungsfreiInput,
    Verdict,
    evaluate_genehmigungsfrei,
)
from ..engine.bkg_client import resolve_ags
from ..engine.ratelimit import check_and_consume_rate_limit

router = APIRouter(prefix="/api/public", tags=["public"])


# -----------------------------------------------------------------------------
# Request / Response models
# -----------------------------------------------------------------------------


class AddressBlock(BaseModel):
    free_text: str = Field(..., min_length=4, max_length=240)


class GenehmigungsfreiCheckRequest(BaseModel):
    address: AddressBlock
    project_type: str = Field(..., min_length=2, max_length=60)

    # Optional numeric parameters (rule engine picks the ones each rule needs).
    brutto_grundflaeche_m2: float | None = Field(default=None, ge=0)
    brutto_rauminhalt_m3: float | None = Field(default=None, ge=0)
    mittlere_wandhoehe_m: float | None = Field(default=None, ge=0)
    hoehe_m: float | None = Field(default=None, ge=0)
    hoehe_ueber_dach_m: float | None = Field(default=None, ge=0)
    tiefe_m: float | None = Field(default=None, ge=0)
    gesamtlaenge_m: float | None = Field(default=None, ge=0)
    ansichtsflaeche_m2: float | None = Field(default=None, ge=0)

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

    # Sonderlagen toggles (Hinweis-Liste im Verdict).
    denkmalschutz: bool = False
    ueberschwemmungsgebiet: bool = False
    naturschutz: bool = False
    sanierungsgebiet: bool = False
    erhaltungssatzung: bool = False
    gestaltungssatzung: bool = False

    # DSGVO consent - required to call the engine at all.
    consent_data_processing: bool = Field(
        ...,
        description="User hat dem DSGVO-Hinweis aktiv zugestimmt (Pflicht).",
    )

    @field_validator("consent_data_processing")
    @classmethod
    def _must_consent(cls, v: bool) -> bool:
        if not v:
            raise ValueError("Verarbeitung ohne ausdrueckliche Zustimmung nicht zulaessig.")
        return v


class CheckResponseAGS(BaseModel):
    ags_8: str
    bundesland: str
    ort: str | None
    plz: str | None
    source: str
    cache_warning: bool


class CheckResponse(BaseModel):
    ags: CheckResponseAGS
    verdict: Verdict
    rate_limit: dict[str, Any]


class HealthResponse(BaseModel):
    corpus_version: str
    bundesland_active: list[str]
    ags_resolution_mode: str
    rule_count: int
    fallback_verdict_count: int


# -----------------------------------------------------------------------------
# Helpers
# -----------------------------------------------------------------------------


def _client_ip(request: Request) -> str:
    fwd = request.headers.get("x-forwarded-for")
    if fwd:
        return fwd.split(",")[0].strip()
    return request.client.host if request.client else "0.0.0.0"


# -----------------------------------------------------------------------------
# Routes
# -----------------------------------------------------------------------------


@router.get("/genehmigungsfrei/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    settings = get_settings()
    meta = get_metadata("BY")
    rules_doc = get_verfahrensfreie_rules("BY")
    return HealthResponse(
        corpus_version=str(meta.get("corpus_version", "unknown")),
        bundesland_active=[meta.get("bundesland_code", "BY")],
        ags_resolution_mode="bkg_api" if settings.bkg_api_key else "local_fallback",
        rule_count=len(rules_doc.get("rules", [])),
        fallback_verdict_count=len(rules_doc.get("fallback_verdicts", [])),
    )


@router.get("/genehmigungsfrei/project-types")
async def project_types() -> dict[str, Any]:
    rules_doc = get_verfahrensfreie_rules("BY")
    seen: dict[str, dict[str, Any]] = {}
    for rule in rules_doc.get("rules", []):
        for pt in rule["project_types"]:
            if pt not in seen:
                seen[pt] = {
                    "value": pt,
                    "title": rule["title"],
                    "verdict_default": "verfahrensfrei",
                    "fields_required": [c["feld"] for c in rule.get("conditions_all", [])],
                }
    for fb in rules_doc.get("fallback_verdicts", []):
        for pt in fb["project_types"]:
            if pt not in seen:
                seen[pt] = {
                    "value": pt,
                    "title": pt.replace("_", " ").title(),
                    "verdict_default": fb["verdict"],
                    "fields_required": [],
                }
    return {"project_types": list(seen.values())}


@router.post("/genehmigungsfrei/check", response_model=CheckResponse)
async def genehmigungsfrei_check(
    body: GenehmigungsfreiCheckRequest,
    request: Request,
) -> CheckResponse:
    raw_ip = _client_ip(request)
    rl = await check_and_consume_rate_limit(raw_ip, "genehmigungsfrei")
    if not rl.allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail={
                "reason": rl.reason,
                "limit_per_day": rl.limit_per_day,
                "bucket_date": rl.bucket_date,
            },
        )

    resolution = await resolve_ags(body.address.free_text)
    if resolution is None:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=(
                "Adresse konnte nicht in einen AGS-Code aufgeloest werden. "
                "Bitte Adresse pruefen oder vollstaendige Postanschrift mit PLZ und Ort verwenden."
            ),
        )

    engine_payload = GenehmigungsfreiInput(
        bundesland_code="BY",
        ags_8=resolution.ags_8,
        project_type=body.project_type,
        brutto_grundflaeche_m2=body.brutto_grundflaeche_m2,
        brutto_rauminhalt_m3=body.brutto_rauminhalt_m3,
        mittlere_wandhoehe_m=body.mittlere_wandhoehe_m,
        hoehe_m=body.hoehe_m,
        hoehe_ueber_dach_m=body.hoehe_ueber_dach_m,
        tiefe_m=body.tiefe_m,
        gesamtlaenge_m=body.gesamtlaenge_m,
        ansichtsflaeche_m2=body.ansichtsflaeche_m2,
        im_aussenbereich=body.im_aussenbereich,
        hat_aufenthaltsraum=body.hat_aufenthaltsraum,
        hat_toilette=body.hat_toilette,
        hat_feuerstaette=body.hat_feuerstaette,
        ist_an_oder_auf_gebaeude=body.ist_an_oder_auf_gebaeude,
        ist_hochhaus=body.ist_hochhaus,
        ist_freistehend=body.ist_freistehend,
        ist_instandhaltung_ohne_eingriff=body.ist_instandhaltung_ohne_eingriff,
        eingriff_in_tragende_teile=body.eingriff_in_tragende_teile,
        eingriff_in_brandschutz=body.eingriff_in_brandschutz,
        veraenderung_aussenhuelle=body.veraenderung_aussenhuelle,
        denkmalschutz=body.denkmalschutz,
        ueberschwemmungsgebiet=body.ueberschwemmungsgebiet,
        naturschutz=body.naturschutz,
        sanierungsgebiet=body.sanierungsgebiet,
        erhaltungssatzung=body.erhaltungssatzung,
        gestaltungssatzung=body.gestaltungssatzung,
    )
    verdict = evaluate_genehmigungsfrei(engine_payload)
    return CheckResponse(
        ags=CheckResponseAGS(
            ags_8=resolution.ags_8,
            bundesland=resolution.bundesland,
            ort=resolution.ort,
            plz=resolution.plz,
            source=resolution.source,
            cache_warning=resolution.cache_warning,
        ),
        verdict=verdict,
        rate_limit={
            "count_today": rl.count_today,
            "limit_per_day": rl.limit_per_day,
            "bucket_date": rl.bucket_date,
        },
    )


# -----------------------------------------------------------------------------
# /grz-rechner - stateless GRZ/GFZ/BMZ calculator
# -----------------------------------------------------------------------------


class GRZRequest(BaseModel):
    grundstuecksflaeche_m2: float = Field(..., gt=0)
    grundflaeche_hauptanlage_m2: float = Field(..., ge=0)
    grundflaeche_nebenanlagen_m2: float = Field(default=0, ge=0)
    geschossflaeche_m2: float = Field(..., ge=0)
    bruttorauminhalt_m3: float | None = Field(default=None, ge=0)
    bplan_grz: float | None = Field(default=None, ge=0, le=1.0)
    bplan_gfz: float | None = Field(default=None, ge=0, le=3.0)
    bplan_bmz: float | None = Field(default=None, ge=0)


class GRZResponse(BaseModel):
    grz: float
    grz_inkl_nebenanlagen: float
    gfz: float
    bmz: float | None
    bplan_compliance: dict[str, Any]
    rechtsgrundlage: dict[str, str]


@router.post("/grz-rechner", response_model=GRZResponse)
async def grz_rechner(body: GRZRequest) -> GRZResponse:
    grz = round(body.grundflaeche_hauptanlage_m2 / body.grundstuecksflaeche_m2, 3)
    grz_overall = round(
        (body.grundflaeche_hauptanlage_m2 + body.grundflaeche_nebenanlagen_m2)
        / body.grundstuecksflaeche_m2,
        3,
    )
    gfz = round(body.geschossflaeche_m2 / body.grundstuecksflaeche_m2, 3)
    bmz = (
        round(body.bruttorauminhalt_m3 / body.grundstuecksflaeche_m2, 3)
        if body.bruttorauminhalt_m3 is not None
        else None
    )

    compliance: dict[str, Any] = {}
    if body.bplan_grz is not None:
        compliance["grz"] = {
            "limit": body.bplan_grz,
            "actual": grz,
            "status": "konform" if grz <= body.bplan_grz else "ueberschreitung",
            "delta": round(grz - body.bplan_grz, 3),
        }
    if body.bplan_gfz is not None:
        compliance["gfz"] = {
            "limit": body.bplan_gfz,
            "actual": gfz,
            "status": "konform" if gfz <= body.bplan_gfz else "ueberschreitung",
            "delta": round(gfz - body.bplan_gfz, 3),
        }
    if body.bplan_bmz is not None and bmz is not None:
        compliance["bmz"] = {
            "limit": body.bplan_bmz,
            "actual": bmz,
            "status": "konform" if bmz <= body.bplan_bmz else "ueberschreitung",
            "delta": round(bmz - body.bplan_bmz, 3),
        }

    return GRZResponse(
        grz=grz,
        grz_inkl_nebenanlagen=grz_overall,
        gfz=gfz,
        bmz=bmz,
        bplan_compliance=compliance,
        rechtsgrundlage={
            "grz": "§ 17, 19 BauNVO",
            "gfz": "§ 17, 20 BauNVO",
            "bmz": "§ 17, 21 BauNVO",
            "quelle_url": "https://www.gesetze-im-internet.de/baunvo/",
        },
    )
