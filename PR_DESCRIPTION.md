# feat(tools): add ODD Platform health check CLI

## Summary

Adds `tools/healthcheck/odd_healthcheck.py` — a zero-dependency Python CLI for verifying ODD Platform deployments.

This came out of a common pain point: after spinning up ODD via Docker or Helm, there's no quick way to confirm the platform is fully functional beyond manually opening a browser. This tool fills that gap.

---

## What it checks

| Check | Endpoint | Notes |
|---|---|---|
| Platform reachable | `/` | HTTP 200 confirms the app is up |
| Swagger / api-docs | `/api/v3/api-docs` | Confirms API contract is served |
| Spring Actuator health | `/actuator/health` | Optional; soft warning if not enabled |
| Ingestion API | `/ingestion/entities` | POST-only; GET→405 confirms route exists |
| Datasources API | `/api/datasources` | Requires `--token`; counts registered sources |

---

## Usage

```bash
# Basic (no auth)
python tools/healthcheck/odd_healthcheck.py --url http://localhost:8080

# Authenticated
python tools/healthcheck/odd_healthcheck.py --url https://odd.mycompany.com --token <tok>

# CI-friendly JSON output (exits 1 on any failure)
python tools/healthcheck/odd_healthcheck.py --url http://localhost:8080 --json
```

---

## Design decisions

- **Zero dependencies** — only `urllib` from the stdlib. No `requests`, no `httpx`. Works on any Python 3.7+ environment without pip install.
- **Exit code semantics** — exits `0` if all checks pass, `1` otherwise, making it safe to use as a CI gate.
- **Warnings vs failures** — missing optional infrastructure (e.g., Actuator not enabled) surfaces as `WARN`, not `FAIL`, so it doesn't block deployments that intentionally omit it.
- **JSON mode** — structured output for integration with monitoring pipelines, dashboards, or shell scripts.

---

## Files changed

```
tools/healthcheck/
├── odd_healthcheck.py          # main CLI (stdlib only)
├── README.md                   # usage, examples, actuator config note
├── tests/
│   └── test_odd_healthcheck.py # 24 unit tests (all mocked, no live server needed)
└── .github/workflows/
    └── healthcheck-tests.yml   # CI matrix: Python 3.8 / 3.10 / 3.12
```

---

## Test results

```
24 passed in 0.18s  ✔
```

Covers: connection errors, HTTP status variants, JSON parsing, token skip logic, ANSI colour toggle, and report summary structure.

---

## Checklist

- [x] No new dependencies introduced
- [x] All tests pass locally
- [x] `--help` works
- [x] Exit codes are correct for scripting use
- [x] Docs include actuator configuration note
