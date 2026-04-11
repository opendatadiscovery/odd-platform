"""
Tests for odd_healthcheck.py

Run with:  python -m pytest tests/ -v
"""
import json
import sys
import types
import unittest
from unittest.mock import MagicMock, patch

# ── import the module under test ──────────────────────────────────────────────
sys.path.insert(0, ".")
import odd_healthcheck as hc  # noqa: E402


# ── helpers ───────────────────────────────────────────────────────────────────

def _mock_response(status: int, body: bytes, latency: float = 50.0):
    """Returns a tuple matching _safe_request output: (status, body, latency, error)."""
    return (status, body, latency, None)


def _mock_error(msg: str):
    return (None, None, None, msg)


# ── CheckResult / HealthReport ────────────────────────────────────────────────

class TestCheckResult(unittest.TestCase):
    def test_defaults(self):
        r = hc.CheckResult("foo", True)
        self.assertEqual(r.name, "foo")
        self.assertTrue(r.passed)
        self.assertEqual(r.detail, "")
        self.assertIsNone(r.latency_ms)
        self.assertFalse(r.warning)

    def test_fields(self):
        r = hc.CheckResult("bar", False, detail="oops", latency_ms=99.9, warning=True)
        self.assertFalse(r.passed)
        self.assertEqual(r.detail, "oops")
        self.assertAlmostEqual(r.latency_ms, 99.9)
        self.assertTrue(r.warning)


class TestHealthReport(unittest.TestCase):
    def test_all_passed_empty(self):
        report = hc.HealthReport(base_url="http://x")
        self.assertTrue(report.all_passed)

    def test_all_passed_false(self):
        report = hc.HealthReport(base_url="http://x")
        report.add(hc.CheckResult("a", True))
        report.add(hc.CheckResult("b", False))
        self.assertFalse(report.all_passed)

    def test_summary_structure(self):
        report = hc.HealthReport(base_url="http://x", timestamp="2026-01-01")
        report.add(hc.CheckResult("c1", True, detail="ok", latency_ms=10.0))
        s = report.summary
        self.assertEqual(s["base_url"], "http://x")
        self.assertEqual(s["timestamp"], "2026-01-01")
        self.assertTrue(s["all_passed"])
        self.assertEqual(len(s["checks"]), 1)
        self.assertEqual(s["checks"][0]["name"], "c1")


# ── check_platform_reachable ──────────────────────────────────────────────────

class TestCheckPlatformReachable(unittest.TestCase):
    @patch("odd_healthcheck._safe_request", return_value=(200, b"", 42.0, None))
    def test_pass(self, _):
        r = hc.check_platform_reachable("http://localhost:8080", None)
        self.assertTrue(r.passed)
        self.assertIn("200", r.detail)
        self.assertAlmostEqual(r.latency_ms, 42.0)

    @patch("odd_healthcheck._safe_request", return_value=(503, b"", 10.0, None))
    def test_unexpected_status(self, _):
        r = hc.check_platform_reachable("http://localhost:8080", None)
        self.assertFalse(r.passed)
        self.assertIn("503", r.detail)

    @patch("odd_healthcheck._safe_request", return_value=(None, None, None, "timeout"))
    def test_connection_error(self, _):
        r = hc.check_platform_reachable("http://localhost:8080", None)
        self.assertFalse(r.passed)
        self.assertIn("timeout", r.detail)


# ── check_swagger_ui ──────────────────────────────────────────────────────────

class TestCheckSwaggerUI(unittest.TestCase):
    @patch("odd_healthcheck._safe_request")
    def test_pass_with_title(self, mock_req):
        body = json.dumps({"info": {"title": "ODD Platform"}}).encode()
        mock_req.return_value = (200, body, 55.0, None)
        r = hc.check_swagger_ui("http://localhost:8080")
        self.assertTrue(r.passed)
        self.assertIn("ODD Platform", r.detail)

    @patch("odd_healthcheck._safe_request")
    def test_pass_non_json(self, mock_req):
        mock_req.return_value = (200, b"not-json", 20.0, None)
        r = hc.check_swagger_ui("http://localhost:8080")
        self.assertTrue(r.passed)

    @patch("odd_healthcheck._safe_request")
    def test_fail_404(self, mock_req):
        mock_req.return_value = (404, b"", 10.0, None)
        r = hc.check_swagger_ui("http://localhost:8080")
        self.assertFalse(r.passed)
        self.assertIn("404", r.detail)


# ── check_spring_actuator ─────────────────────────────────────────────────────

class TestCheckSpringActuator(unittest.TestCase):
    @patch("odd_healthcheck._safe_request")
    def test_up(self, mock_req):
        body = json.dumps({"status": "UP"}).encode()
        mock_req.return_value = (200, body, 30.0, None)
        r = hc.check_spring_actuator("http://localhost:8080")
        self.assertTrue(r.passed)
        self.assertIn("UP", r.detail)

    @patch("odd_healthcheck._safe_request")
    def test_down(self, mock_req):
        body = json.dumps({"status": "DOWN"}).encode()
        mock_req.return_value = (200, body, 30.0, None)
        r = hc.check_spring_actuator("http://localhost:8080")
        self.assertFalse(r.passed)

    @patch("odd_healthcheck._safe_request")
    def test_not_enabled(self, mock_req):
        mock_req.return_value = (404, b"", 5.0, None)
        r = hc.check_spring_actuator("http://localhost:8080")
        self.assertFalse(r.passed)
        self.assertTrue(r.warning)  # soft warning, not hard failure

    @patch("odd_healthcheck._safe_request")
    def test_connection_error_is_warning(self, mock_req):
        mock_req.return_value = (None, None, None, "refused")
        r = hc.check_spring_actuator("http://localhost:8080")
        self.assertFalse(r.passed)
        self.assertTrue(r.warning)


# ── check_ingestion_api ───────────────────────────────────────────────────────

class TestCheckIngestionAPI(unittest.TestCase):
    @patch("odd_healthcheck._safe_request")
    def test_405_is_pass(self, mock_req):
        """GET → 405 means the POST-only endpoint exists — that's correct."""
        mock_req.return_value = (405, b"", 25.0, None)
        r = hc.check_ingestion_api("http://localhost:8080", None)
        self.assertTrue(r.passed)

    @patch("odd_healthcheck._safe_request")
    def test_401_is_pass(self, mock_req):
        mock_req.return_value = (401, b"", 20.0, None)
        r = hc.check_ingestion_api("http://localhost:8080", None)
        self.assertTrue(r.passed)

    @patch("odd_healthcheck._safe_request")
    def test_500_is_fail(self, mock_req):
        mock_req.return_value = (500, b"", 10.0, None)
        r = hc.check_ingestion_api("http://localhost:8080", None)
        self.assertFalse(r.passed)

    @patch("odd_healthcheck._safe_request")
    def test_connection_error(self, mock_req):
        mock_req.return_value = (None, None, None, "timeout")
        r = hc.check_ingestion_api("http://localhost:8080", None)
        self.assertFalse(r.passed)


# ── check_datasources_api ─────────────────────────────────────────────────────

class TestCheckDatasourcesAPI(unittest.TestCase):
    def test_skipped_without_token(self):
        r = hc.check_datasources_api("http://localhost:8080", None)
        self.assertFalse(r.passed)
        self.assertTrue(r.warning)
        self.assertIn("no --token", r.detail)

    @patch("odd_healthcheck._safe_request")
    def test_pass_with_total(self, mock_req):
        body = json.dumps({"pageInfo": {"total": 7}}).encode()
        mock_req.return_value = (200, body, 60.0, None)
        r = hc.check_datasources_api("http://localhost:8080", "tok123")
        self.assertTrue(r.passed)
        self.assertIn("7", r.detail)

    @patch("odd_healthcheck._safe_request")
    def test_401_token_failure(self, mock_req):
        mock_req.return_value = (401, b"", 10.0, None)
        r = hc.check_datasources_api("http://localhost:8080", "bad-token")
        self.assertFalse(r.passed)
        self.assertIn("401", r.detail)


# ── coloured ──────────────────────────────────────────────────────────────────

class TestColoured(unittest.TestCase):
    def test_with_colour(self):
        result = hc.coloured("hello", hc.GREEN, use_colour=True)
        self.assertIn("hello", result)
        self.assertIn(hc.GREEN, result)
        self.assertIn(hc.RESET, result)

    def test_without_colour(self):
        result = hc.coloured("hello", hc.GREEN, use_colour=False)
        self.assertEqual(result, "hello")
        self.assertNotIn(hc.RESET, result)


if __name__ == "__main__":
    unittest.main()
