# syntax=docker/dockerfile:1.7-labs

# Build stage: install with uv for reproducibility.
FROM python:3.12-slim-bookworm AS build
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    UV_LINK_MODE=copy \
    UV_COMPILE_BYTECODE=1

RUN apt-get update \
  && apt-get install -y --no-install-recommends curl ca-certificates \
  && rm -rf /var/lib/apt/lists/* \
  && pip install --no-cache-dir uv==0.4.27

WORKDIR /app

COPY pyproject.toml ./
COPY src ./src

RUN uv venv /opt/venv
ENV PATH=/opt/venv/bin:$PATH
RUN uv pip install -e .

# Runtime stage: minimal, non-root user.
FROM python:3.12-slim-bookworm AS runtime
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PATH=/opt/venv/bin:$PATH

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
      tini \
      ca-certificates \
  && rm -rf /var/lib/apt/lists/* \
  && groupadd --system strota \
  && useradd --system --gid strota --home /app strota

WORKDIR /app

COPY --from=build /opt/venv /opt/venv
COPY --from=build /app/src ./src
COPY pyproject.toml ./

USER strota

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl --fail --silent --show-error http://localhost:8000/healthz || exit 1

ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["uvicorn", "strota_api.main:app", "--host", "0.0.0.0", "--port", "8000", "--proxy-headers"]
