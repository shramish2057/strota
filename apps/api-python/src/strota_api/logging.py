"""Structured logging setup per v5.0 §3.2 Observability.

JSON output with Pflichtfeldern timestamp/level/service/trace_id/request_id.
PII redaction is layered via Allow-List Pattern in the request middleware.
"""

from __future__ import annotations

import logging
import sys
from typing import cast

import structlog

from .config import get_settings


def configure_logging() -> None:
    """Initialize structlog + stdlib logging once at process start."""

    settings = get_settings()

    timestamper = structlog.processors.TimeStamper(fmt="iso", utc=True)

    shared_processors: list[structlog.types.Processor] = [
        structlog.contextvars.merge_contextvars,
        structlog.processors.add_log_level,
        structlog.processors.StackInfoRenderer(),
        timestamper,
        structlog.processors.format_exc_info,
    ]

    structlog.configure(
        processors=[
            *shared_processors,
            structlog.stdlib.ProcessorFormatter.wrap_for_formatter,
        ],
        wrapper_class=structlog.make_filtering_bound_logger(
            getattr(logging, settings.log_level.upper(), logging.INFO),
        ),
        context_class=dict,
        logger_factory=structlog.stdlib.LoggerFactory(),
        cache_logger_on_first_use=True,
    )

    formatter = structlog.stdlib.ProcessorFormatter(
        foreign_pre_chain=shared_processors,
        processor=structlog.processors.JSONRenderer(),
    )

    handler = logging.StreamHandler(stream=sys.stdout)
    handler.setFormatter(formatter)

    root = logging.getLogger()
    root.handlers = [handler]
    root.setLevel(getattr(logging, settings.log_level.upper(), logging.INFO))

    # Inject service name as default context
    structlog.contextvars.bind_contextvars(service=settings.service_name)


def get_logger(name: str | None = None) -> structlog.stdlib.BoundLogger:
    """Return a bound structlog logger.

    structlog.get_logger is typed as returning Any, so we cast to the bound
    type that our configure_logging call enforces (stdlib.BoundLogger via
    LoggerFactory above).
    """
    return cast(structlog.stdlib.BoundLogger, structlog.get_logger(name))
