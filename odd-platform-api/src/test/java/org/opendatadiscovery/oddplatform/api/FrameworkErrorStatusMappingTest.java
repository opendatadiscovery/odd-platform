package org.opendatadiscovery.oddplatform.api;

import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.BaseIntegrationTest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.reactive.AutoConfigureWebTestClient;
import org.springframework.test.web.reactive.server.WebTestClient;

/**
 * Framework-raised errors must keep their HTTP status — the ControllerAdvice
 * {@code ResponseStatusException} pass-through (ADR-0007: one advice maps the whole hierarchy).
 *
 * <p>Before the fix, the catch-all {@code @ExceptionHandler(Exception.class)} swallowed every
 * framework {@code ResponseStatusException} — an unmatched {@code /api} route
 * ({@code NoResourceFoundException}, 404) and an invalid/missing request input
 * ({@code ServerWebInputException}, 400) were both re-branded 500 {@code SYS001}, telling API
 * clients the platform broke when the request was the problem (and logging routine 4xx at ERROR).
 *
 * <p>Reproduced live 2026-06-11 (issues #1760, #1761): {@code GET /api/search/{id}/filters/...}
 * (no such route) → 500; {@code GET /api/search/{id}/facet/entityClasses} (invalid enum) → 500;
 * {@code GET /api/owner_association_request/activity} without the required {@code status} → 500.
 *
 * @regresses #1760 (PLT-150 — search deep-link error contract), #1761 (PLT-143 — required-param 500)
 * @enforces ADR-0007 — centralised error translation covers the framework hierarchy too
 */
@AutoConfigureWebTestClient(timeout = "60000")
public class FrameworkErrorStatusMappingTest extends BaseIntegrationTest {

    private static final String MISSING_SESSION = UUID.randomUUID().toString();

    @Autowired
    private WebTestClient webTestClient;

    /** #1760's literal reproduction URL: matches NO route → framework 404, not 500 SYS001. */
    @Test
    public void unmatchedApiRouteKeepsFramework404() {
        webTestClient.get()
            .uri("/api/search/{id}/filters/entityClasses", MISSING_SESSION)
            .exchange()
            .expectStatus().isNotFound()
            .expectBody()
            .jsonPath("$.code").isEqualTo("USR002");
    }

    /** Invalid enum path segment → ServerWebInputException (400), not 500 SYS001. */
    @Test
    public void invalidEnumPathParamKeepsFramework400() {
        webTestClient.get()
            .uri("/api/search/{id}/facet/entityClasses?page=1&size=30", MISSING_SESSION)
            .exchange()
            .expectStatus().isBadRequest()
            .expectBody()
            .jsonPath("$.code").isEqualTo("USR001");
    }

    /** #1761's surface: a missing required query param → 400 USR001 with the framework's reason. */
    @Test
    public void missingRequiredQueryParamKeepsFramework400() {
        webTestClient.get()
            .uri("/api/owner_association_request/activity?page=1&size=10")
            .exchange()
            .expectStatus().isBadRequest()
            .expectBody()
            .jsonPath("$.code").isEqualTo("USR001")
            .jsonPath("$.message").value(msg -> org.assertj.core.api.Assertions.assertThat((String) msg)
                .as("the body carries the framework's actionable reason, not 'Internal Server Error'")
                .contains("status"));
    }

    /** Control: the platform's own NotFoundException mapping still wins on the real filters route. */
    @Test
    public void missingSearchSessionOnRealFacetRouteStays404() {
        webTestClient.get()
            .uri("/api/search/{id}/facet/TAGS?page=1&size=30", MISSING_SESSION)
            .exchange()
            .expectStatus().isNotFound()
            .expectBody()
            .jsonPath("$.code").isEqualTo("USR002")
            .jsonPath("$.message").isEqualTo("Search not found");
    }

    /** Control: WebExchangeBindException (a ResponseStatusException subclass) keeps its
     *  more-specific field-error mapping — Spring resolves the closest handler type. */
    @Test
    public void bodyValidationStillReturnsFieldErrors() {
        webTestClient.post()
            .uri("/api/datasources")
            .header("Content-Type", "application/json")
            .bodyValue("{}")
            .exchange()
            .expectStatus().isBadRequest()
            .expectBody()
            .jsonPath("$.code").isEqualTo("USR001")
            .jsonPath("$.details").isArray();
    }
}
