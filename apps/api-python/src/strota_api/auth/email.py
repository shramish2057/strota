"""Postmark email sender + German templates.

In dev/CI without POSTMARK_SERVER_TOKEN we log to stdout instead of sending,
so tests do not need network.
"""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from string import Template

import httpx

from ..config import get_settings
from ..logging import get_logger

_log = get_logger("auth.email")

POSTMARK_URL = "https://api.postmarkapp.com/email"
TEMPLATES_DIR = Path(__file__).parent / "emails"


@dataclass(frozen=True)
class EmailMessage:
    to: str
    subject: str
    text_body: str
    html_body: str
    tag: str


def render_template(template_name: str, **context: str) -> tuple[str, str, str]:
    """Render `{name}.subject.txt`, `.txt`, and `.html` with simple ${var} substitution.

    Returns (subject, text_body, html_body).
    """
    subj = (TEMPLATES_DIR / f"{template_name}.subject.txt").read_text(encoding="utf-8")
    txt = (TEMPLATES_DIR / f"{template_name}.txt").read_text(encoding="utf-8")
    html = (TEMPLATES_DIR / f"{template_name}.html").read_text(encoding="utf-8")
    return (
        Template(subj).safe_substitute(**context).strip(),
        Template(txt).safe_substitute(**context),
        Template(html).safe_substitute(**context),
    )


async def send_email(message: EmailMessage) -> None:
    """Dispatch via Postmark when configured; log to stdout otherwise."""
    s = get_settings()
    if not s.postmark_server_token:
        _log.warning(
            "email.dispatch.stub",
            to=message.to,
            subject=message.subject,
            tag=message.tag,
            note="POSTMARK_SERVER_TOKEN unset, logging only",
        )
        return
    body = {
        "From": f"{s.email_from_name} <{s.email_from_address}>",
        "To": message.to,
        "Subject": message.subject,
        "TextBody": message.text_body,
        "HtmlBody": message.html_body,
        "Tag": message.tag,
        "MessageStream": "outbound",
    }
    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.post(
            POSTMARK_URL,
            headers={
                "Accept": "application/json",
                "Content-Type": "application/json",
                "X-Postmark-Server-Token": s.postmark_server_token,
            },
            json=body,
        )
        if resp.status_code >= 400:
            _log.error("email.dispatch.failed", status=resp.status_code, body=resp.text)
            resp.raise_for_status()
        _log.info("email.dispatch.sent", to=message.to, tag=message.tag)


# ---------------------------------------------------------------------
# Convenience builders for each Strota flow.
# ---------------------------------------------------------------------
def build_email_verification(*, to: str, verify_url: str, full_name: str = "") -> EmailMessage:
    subject, text_body, html_body = render_template(
        "verify_email", verify_url=verify_url, name=full_name or ""
    )
    return EmailMessage(
        to=to, subject=subject, text_body=text_body, html_body=html_body, tag="verify-email"
    )


def build_password_reset(*, to: str, reset_url: str, full_name: str = "") -> EmailMessage:
    subject, text_body, html_body = render_template(
        "password_reset", reset_url=reset_url, name=full_name or ""
    )
    return EmailMessage(
        to=to, subject=subject, text_body=text_body, html_body=html_body, tag="password-reset"
    )


def build_magic_link(*, to: str, magic_url: str, full_name: str = "") -> EmailMessage:
    subject, text_body, html_body = render_template(
        "magic_link", magic_url=magic_url, name=full_name or ""
    )
    return EmailMessage(
        to=to, subject=subject, text_body=text_body, html_body=html_body, tag="magic-link"
    )
