#!/usr/bin/env python3
"""
ODD Platform Health Check CLI
==============================
A diagnostic tool for verifying ODD Platform deployments.
Checks API reachability, Swagger availability, ingestion endpoint,
and optionally validates datasource connectivity.

Usage:
    python odd_healthcheck.py --url http://localhost:8080
    python odd_healthcheck.py --url https://your-odd-instance.com --token <api-token>
    python odd_healthcheck.py --url http://localhost:8080 --json
"""

import argparse
import json
import sys
import time
import urllib.error
import urllib.request
from dataclasses import dataclass, field
from typing import Optional


# ── ANSI colours ─────────────────────────────────────────────────────────────

GREEN = "\033[92m"
RED = "\033[91m"
YELLOW = "\033[93m"
CYAN = "\033[96m"
BOLD = "\033[1m"
RESET = "\033[0m"


def _no_colour(code: str) -> str:  # noqa: ARG001
    return ""


def coloured(text: str, code: str, use_colour: bool = True) -> str:
    if not use_colour:
        return text
    return f"{code}{text}{RESET}"


# ── Check result ──────────────────────────────────────────────────────────────

@dataclass
class CheckResult:
    name: str
    passed: bool
    detail: str = ""
    latency_ms: Optional[float] = None
    warning: bool = False


@dataclass
class HealthReport:
    base_url: str
    results: list = field(default_factory=list)
    timestamp: str = ""

    def add(self, result: CheckResult) -> None:
        self.results.append(result)

    @property
    def all_passed(self) -> bool:
        return all(r.passed for r in self.results)

    @property
    def summary(self) -> dict:
        return {
            "base_url": self.base_url,
            "timestamp": self.timestamp,
            "all_passed": self.all_passed,
            "checks": [
                {
                    "name": r.name,
                    "passed": r.passed,
                    "detail": r.detail,
                    "latency_ms": r.latency_ms,
                    "warning": r.warning,
                }
                for r in self.results
            ],
        }


# ── HTTP helpers ──────────────────────────────────────────────────────────────

def _request(
    url: str,
    token: Optional[str] = None,
    timeout: int = 10,
    method: str = "GET",
    body: Optional[bytes] = None,
) -> tuple[int, bytes, float]:
    """
    Returns (status_code, response_body, latency_ms).
    Raises urllib.error.URLError / urllib.error.HTTPError on failure.
    """
    headers = {"Accept": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    if body:
        headers["Content-Type"] = "application/json"

    req = urllib.request.Request(url, headers=headers, method=method, data=body)
    t0 = time.monotonic()
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        data = resp.read()
    latency = (time.monotonic() - t0) * 1000
    return resp.status, data, latency  # type: ignore[union-attr]


def _safe_request(
    url: str,
    token: Optional[str] = None,
    timeout: int = 10,
) -> tuple[Optional[int], Optional[bytes], Optional[float], Optional[str]]:
    """Returns (status, body, latency_ms, error_message)."""
    try:
        status, body, latency = _request(url, token=token, timeout=timeout)
        return status, body, latency, None
    except urllib.error.HTTPError as exc:
        try:
            latency = None  # HTTPError has no timing
            return exc.code, exc.read(), None, None
        except Exception:
            return exc.code, None, None, str(exc)
    except Exception as exc:  # noqa: BLE001
        return None, None, None, str(exc)


# ── Individual checks ─────────────────────────────────────────────────────────

def check_platform_reachable(base_url: str, token: Optional[str]) -> CheckResult:
    """Checks that the platform root responds with HTTP 200."""
    url = base_url.rstrip("/")
    status, _, latency, err = _safe_request(url, token=token)

    if err:
        return CheckResult("Platform reachable", False, f"Connection error: {err}")
    if status == 200:
        return CheckResult(
            "Platform reachable", True,
            f"HTTP {status}", latency_ms=latency,
        )
    return CheckResult(
        "Platform reachable", False,
        f"Unexpected HTTP {status}", latency_ms=latency,
    )


def check_swagger_ui(base_url: str) -> CheckResult:
    """Checks that the Swagger UI / api-docs endpoint is available."""
    url = f"{base_url.rstrip('/')}/api/v3/api-docs"
    status, body, latency, err = _safe_request(url)

    if err:
        return CheckResult("Swagger / api-docs", False, f"Connection error: {err}")
    if status == 200:
        try:
            doc = json.loads(body or b"{}")
            title = doc.get("info", {}).get("title", "unknown")
            return CheckResult(
                "Swagger / api-docs", True,
                f"API title: '{title}'", latency_ms=latency,
            )
        except json.JSONDecodeError:
            return CheckResult(
                "Swagger / api-docs", True,
                "Responded 200 (non-JSON body)", latency_ms=latency,
            )
    return CheckResult(
        "Swagger / api-docs", False,
        f"HTTP {status}", latency_ms=latency,
    )


def check_spring_actuator(base_url: str) -> CheckResult:
    """
    Checks Spring Boot Actuator health endpoint.
    This endpoint is optional — only exposed if management.endpoints.web.exposure.include
    contains 'health'. Reported as a warning, not a failure, if absent.
    """
    url = f"{base_url.rstrip('/')}/actuator/health"
    status, body, latency, err = _safe_request(url)

    if err or status is None:
        return CheckResult(
            "Actuator /health", False,
            "Not reachable (may not be enabled — set management.endpoints.web.exposure.include=health)",
            warning=True,
        )
    if status == 200:
        try:
            data = json.loads(body or b"{}")
            app_status = data.get("status", "UNKNOWN")
            return CheckResult(
                "Actuator /health", app_status == "UP",
                f"Spring status: {app_status}", latency_ms=latency,
            )
        except json.JSONDecodeError:
            return CheckResult("Actuator /health", True, "HTTP 200 (non-JSON)", latency_ms=latency)
    if status == 404:
        return CheckResult(
            "Actuator /health", False,
            "Endpoint not found (actuator may not be enabled)",
            warning=True,
        )
    return CheckResult("Actuator /health", False, f"HTTP {status}", latency_ms=latency)


def check_ingestion_api(base_url: str, token: Optional[str]) -> CheckResult:
    """
    Verifies the ingestion API spec endpoint responds.
    GET /ingestion/entities typically returns 405 (Method Not Allowed for GET)
    which still confirms the route exists and the API is live.
    """
    url = f"{base_url.rstrip('/')}/ingestion/entities"
    status, _, latency, err = _safe_request(url, token=token)

    if err:
        return CheckResult("Ingestion API", False, f"Connection error: {err}")
    # 405 = endpoint exists but GET is not allowed (correct — it's POST-only)
    # 401/403 = endpoint exists, auth required
    if status in (200, 405, 401, 403):
        note = {
            405: "POST-only endpoint confirmed (GET → 405, expected)",
            401: "Endpoint reachable — authentication required",
            403: "Endpoint reachable — access forbidden (check token scope)",
            200: "Endpoint responded 200",
        }[status]
        return CheckResult("Ingestion API", True, note, latency_ms=latency)
    return CheckResult("Ingestion API", False, f"Unexpected HTTP {status}", latency_ms=latency)


def check_datasources_api(base_url: str, token: Optional[str]) -> CheckResult:
    """Lists datasources via the platform API (requires auth token)."""
    if not token:
        return CheckResult(
            "Datasources API", False,
            "Skipped — no --token provided",
            warning=True,
        )
    url = f"{base_url.rstrip('/')}/api/datasources?page=1&size=1"
    status, body, latency, err = _safe_request(url, token=token)

    if err:
        return CheckResult("Datasources API", False, f"Connection error: {err}")
    if status == 200:
        try:
            data = json.loads(body or b"{}")
            total = data.get("pageInfo", {}).get("total", "?")
            return CheckResult(
                "Datasources API", True,
                f"Datasources in platform: {total}", latency_ms=latency,
            )
        except json.JSONDecodeError:
            return CheckResult("Datasources API", True, "HTTP 200", latency_ms=latency)
    if status in (401, 403):
        return CheckResult(
            "Datasources API", False,
            f"HTTP {status} — verify your API token",
            latency_ms=latency,
        )
    return CheckResult("Datasources API", False, f"HTTP {status}", latency_ms=latency)


# ── Report rendering ──────────────────────────────────────────────────────────

def render_report(report: HealthReport, use_colour: bool = True) -> None:
    c = lambda text, code: coloured(text, code, use_colour)  # noqa: E731

    print()
    print(c("━" * 58, BOLD))
    print(c("  ODD Platform — Health Check Report", BOLD))
    print(c(f"  {report.base_url}", CYAN))
    print(c(f"  {report.timestamp}", ""))
    print(c("━" * 58, BOLD))
    print()

    for r in report.results:
        if r.passed:
            icon = c("✔", GREEN)
            status_label = c("PASS", GREEN)
        elif r.warning:
            icon = c("⚠", YELLOW)
            status_label = c("WARN", YELLOW)
        else:
            icon = c("✘", RED)
            status_label = c("FAIL", RED)

        latency_str = f"  {r.latency_ms:.0f}ms" if r.latency_ms is not None else ""
        print(f"  {icon}  [{status_label}]  {r.name}{latency_str}")
        if r.detail:
            print(f"          {c(r.detail, CYAN)}")
        print()

    print(c("━" * 58, BOLD))
    overall = "ALL CHECKS PASSED ✔" if report.all_passed else "SOME CHECKS FAILED ✘"
    colour = GREEN if report.all_passed else RED
    print(f"  {c(overall, colour + BOLD)}")
    print(c("━" * 58, BOLD))
    print()


# ── Entry point ───────────────────────────────────────────────────────────────

def main() -> None:
    parser = argparse.ArgumentParser(
        description="Health-check tool for ODD Platform deployments.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    parser.add_argument(
        "--url",
        default="http://localhost:8080",
        metavar="URL",
        help="Base URL of the ODD Platform (default: http://localhost:8080)",
    )
    parser.add_argument(
        "--token",
        default=None,
        metavar="TOKEN",
        help="Bearer token for authenticated endpoints (optional)",
    )
    parser.add_argument(
        "--json",
        action="store_true",
        dest="json_output",
        help="Output results as JSON instead of human-readable text",
    )
    parser.add_argument(
        "--no-colour",
        action="store_true",
        help="Disable ANSI colour output",
    )
    parser.add_argument(
        "--timeout",
        type=int,
        default=10,
        metavar="SECONDS",
        help="Request timeout in seconds (default: 10)",
    )
    args = parser.parse_args()

    use_colour = not args.no_colour and sys.stdout.isatty()
    base_url = args.url.rstrip("/")

    report = HealthReport(
        base_url=base_url,
        timestamp=time.strftime("%Y-%m-%dT%H:%M:%S%z"),
    )

    checks = [
        lambda: check_platform_reachable(base_url, args.token),
        lambda: check_swagger_ui(base_url),
        lambda: check_spring_actuator(base_url),
        lambda: check_ingestion_api(base_url, args.token),
        lambda: check_datasources_api(base_url, args.token),
    ]

    for check_fn in checks:
        result = check_fn()
        report.add(result)

    if args.json_output:
        print(json.dumps(report.summary, indent=2))
    else:
        render_report(report, use_colour=use_colour)

    sys.exit(0 if report.all_passed else 1)


if __name__ == "__main__":
    main()
