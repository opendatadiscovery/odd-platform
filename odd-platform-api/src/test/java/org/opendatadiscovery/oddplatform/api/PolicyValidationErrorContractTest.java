package org.opendatadiscovery.oddplatform.api;

import java.util.Map;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.BaseIntegrationTest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.reactive.AutoConfigureWebTestClient;
import org.springframework.http.MediaType;
import org.springframework.test.web.reactive.server.WebTestClient;

/**
 * The policy-write error contract (#1762): invalid policy JSON is USER input, so it must return
 * {@code 400 USR001} with the actionable validation detail — not the opaque {@code 500 SYS001} it
 * produced before the fix.
 *
 * <p>Before: {@code PolicyJSONValidator} threw a raw {@code IllegalArgumentException}; the
 * ControllerAdvice has no {@code IllegalArgumentException} handler, so it fell to the
 * {@code @ExceptionHandler(Exception.class)} catch-all and surfaced as {@code 500 "Internal Server
 * Error"} — a user mistyping a permission saw a platform-crash status with no hint, while the detail
 * sat only in the server log. After: the validator throws {@code BadUserRequestException}, mapped to
 * {@code 400 USR001} by the existing handler, detail in the body.
 *
 * <p>Reproduced live 2026-06-25: {@code POST /api/policies {policy:"{\"foo\":\"bar\"}"}} -> 500 SYS001.
 *
 * @regresses #1762 (PLT-076 — IllegalArgumentException paths surface as 500 not 400)
 * @enforces ADR-0007 — centralised error translation; a service signals client errors with a typed
 *           domain exception (BadUserRequestException), never a raw IllegalArgumentException
 */
@AutoConfigureWebTestClient(timeout = "60000")
public class PolicyValidationErrorContractTest extends BaseIntegrationTest {

    @Autowired
    private WebTestClient webTestClient;

    /** Valid JSON that violates policy_schema.json (no statements, unknown property) -> 400, not 500. */
    @Test
    public void schemaInvalidPolicyJsonReturns400() {
        webTestClient.post()
            .uri("/api/policies")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(Map.of("name", "ctrib035-schema-invalid", "policy", "{\"foo\":\"bar\"}"))
            .exchange()
            .expectStatus().isBadRequest()
            .expectBody()
            .jsonPath("$.code").isEqualTo("USR001")
            .jsonPath("$.message").value(msg -> org.assertj.core.api.Assertions
                .assertThat((String) msg)
                .as("the body carries the actionable validation detail, not 'Internal Server Error'")
                .startsWith("Policy is not valid:"));
    }

    /** Malformed (unparseable) policy JSON -> 400, not 500. */
    @Test
    public void malformedPolicyJsonReturns400() {
        webTestClient.post()
            .uri("/api/policies")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(Map.of("name", "ctrib035-malformed", "policy", "{ this is not valid json"))
            .exchange()
            .expectStatus().isBadRequest()
            .expectBody()
            .jsonPath("$.code").isEqualTo("USR001")
            .jsonPath("$.message").value(msg -> org.assertj.core.api.Assertions
                .assertThat((String) msg)
                .startsWith("Policy is not valid:"));
    }
}
