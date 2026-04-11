# ODD Platform — Health Check CLI

A zero-dependency Python diagnostic tool for verifying ODD Platform deployments.
Works against any ODD Platform instance — local Docker, Kubernetes, or cloud.

## What it checks

| Check | Description |
|---|---|
| **Platform reachable** | HTTP 200 from the root URL |
| **Swagger / api-docs** | OpenAPI spec endpoint at `/api/v3/api-docs` |
| **Actuator /health** | Spring Boot health (requires actuator to be enabled) |
| **Ingestion API** | `/ingestion/entities` endpoint is routable |
| **Datasources API** | Lists datasources (requires `--token`) |

## Usage

```bash
# Basic check (no auth)
python odd_healthcheck.py --url http://localhost:8080

# With an API token (enables datasources check)
python odd_healthcheck.py --url https://your-odd.company.com --token <your-token>

# Machine-readable JSON output (useful in CI/CD pipelines)
python odd_healthcheck.py --url http://localhost:8080 --json

# Combine flags
python odd_healthcheck.py --url http://localhost:8080 --token <tok> --json --timeout 5
```

## Example output

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ODD Platform — Health Check Report
  http://localhost:8080
  2026-04-11T10:00:00
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ✔  [PASS]  Platform reachable  142ms
          HTTP 200

  ✔  [PASS]  Swagger / api-docs  88ms
          API title: 'ODD Platform'

  ✔  [PASS]  Actuator /health  35ms
          Spring status: UP

  ✔  [PASS]  Ingestion API  61ms
          POST-only endpoint confirmed (GET → 405, expected)

  ⚠  [WARN]  Datasources API
          Skipped — no --token provided

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ALL CHECKS PASSED ✔
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## JSON output (for CI pipelines)

```json
{
  "base_url": "http://localhost:8080",
  "timestamp": "2026-04-11T10:00:00",
  "all_passed": true,
  "checks": [
    { "name": "Platform reachable", "passed": true, "detail": "HTTP 200", "latency_ms": 142, "warning": false },
    { "name": "Swagger / api-docs", "passed": true, "detail": "API title: 'ODD Platform'", "latency_ms": 88, "warning": false },
    ...
  ]
}
```

Exit code is `0` if all checks pass, `1` otherwise — making it suitable for shell scripts and CI gates.

## Requirements

Python 3.7+, no external dependencies (uses `urllib` from the standard library only).

## Enabling Spring Actuator (optional)

To expose the `/actuator/health` endpoint, add to your ODD Platform configuration:

```yaml
management:
  endpoints:
    web:
      exposure:
        include: health
```

Or via environment variable when running Docker:

```bash
docker run ... -e MANAGEMENT_ENDPOINTS_WEB_EXPOSURE_INCLUDE=health ...
```
