package org.opendatadiscovery.oddplatform.api;

import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.BaseIntegrationTest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.reactive.AutoConfigureWebTestClient;
import org.springframework.test.web.reactive.server.WebTestClient;

/**
 * The optional {@code lineage_depth} query parameter must apply a server-side default — the source of truth
 * is the contract: {@code odd-platform-specification/openapi.yaml} declares {@code default: 1} on
 * {@code lineage_depth} for both per-entity lineage operations, which the generator emits as
 * {@code @RequestParam(value = "lineage_depth", required = false, defaultValue = "1")}. So an omitted value
 * binds to {@code 1}, never {@code null}.
 *
 * <p>Before the fix, the two per-entity lineage endpoints forwarded the nullable {@code Integer lineageDepth}
 * straight into {@code LineageServiceImpl.getLineage(long, int, …)}; an omitted {@code lineage_depth}
 * autounboxed {@code null} into the primitive and threw {@code NullPointerException} synchronously — before
 * the entity lookup — which the catch-all {@code @ExceptionHandler(Exception.class)} re-branded HTTP 500
 * {@code SYS001}. The most common first call against the endpoint (no depth) thus failed with an opaque
 * server error rather than reading the lineage graph.
 *
 * <p>Reproduced live 2026-06-22: {@code GET .../lineage/downstream} without {@code lineage_depth} → 500
 * {@code SYS001}; the same id WITH {@code lineage_depth=1} → 404 {@code USR002}. These tests pin that, with
 * the contract default, an omitted depth reaches the service and yields the normal not-found 404 (not a 500),
 * matching an explicit depth of 1.
 *
 * @regresses #1758 (PLT-100 — unset lineage_depth autoboxes null → NPE → HTTP 500)
 */
@AutoConfigureWebTestClient(timeout = "60000")
public class LineageDepthDefaultTest extends BaseIntegrationTest {

    private static final long ABSENT_ENTITY_ID = 999_999_999L;

    @Autowired
    private WebTestClient webTestClient;

    /** Omitted lineage_depth on downstream → the contract default (1) binds → the request reaches the
     *  service and returns the normal 404 for a missing entity, not a 500 SYS001 (RED before the fix). */
    @Test
    public void downstreamLineageWithoutDepthAppliesDefaultAndReturns404() {
        webTestClient.get()
            .uri("/api/dataentities/{id}/lineage/downstream", ABSENT_ENTITY_ID)
            .exchange()
            .expectStatus().isNotFound()
            .expectBody()
            .jsonPath("$.code").isEqualTo("USR002");
    }

    /** Omitted lineage_depth on upstream → same: the default binds, the request reaches the service and
     *  returns 404, not a 500 SYS001 (RED before the fix). */
    @Test
    public void upstreamLineageWithoutDepthAppliesDefaultAndReturns404() {
        webTestClient.get()
            .uri("/api/dataentities/{id}/lineage/upstream", ABSENT_ENTITY_ID)
            .exchange()
            .expectStatus().isNotFound()
            .expectBody()
            .jsonPath("$.code").isEqualTo("USR002");
    }

    /** Control: an explicit lineage_depth=1 produces the same 404 as the omitted call — pinning that the
     *  applied default value is 1 (the call path that already worked before the fix). */
    @Test
    public void explicitDepthOneMatchesTheDefault() {
        webTestClient.get()
            .uri("/api/dataentities/{id}/lineage/downstream?lineage_depth=1", ABSENT_ENTITY_ID)
            .exchange()
            .expectStatus().isNotFound()
            .expectBody()
            .jsonPath("$.code").isEqualTo("USR002");
    }
}
