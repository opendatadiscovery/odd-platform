package org.opendatadiscovery.oddplatform.auth.filter;

import java.util.concurrent.atomic.AtomicReference;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveCollectorRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataSourceRepository;
import org.springframework.http.server.reactive.ServerHttpRequestDecorator;
import org.springframework.mock.http.server.reactive.MockServerHttpRequest;
import org.springframework.mock.web.server.MockServerWebExchange;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;

/**
 * F-008-UC-02 / PLT-003 — characterization pin for the ingestion auth-filter path-coverage gap.
 *
 * <p>The user/security promise (feature-reflections/detail/F-008.yaml, H-/UC-02): "enabling
 * {@code auth.ingestion.filter.enabled} authenticates ALL {@code /ingestion/*} endpoints." The
 * implementation does NOT honour that: each {@link AbstractIngestionFilter} subclass is wired with a
 * {@code PathPatternParserServerWebExchangeMatcher} bound to ONE exact path —
 * {@link IngestionDataEntitiesFilter} matches only {@code POST /ingestion/entities}
 * (IngestionDataEntitiesFilter.java:28) and {@link IngestionDataSourceFilter} only
 * {@code POST /ingestion/datasources} (IngestionDataSourceFilter.java:20). The other real ingestion
 * WRITE endpoints — {@code POST /ingestion/entities/datasets/stats} and {@code POST
 * /ingestion/metrics} — are matched by NEITHER filter, so they accept writes with no collector-token
 * check even when the flag is on.</p>
 *
 * <p>This test drives the REAL filter beans through {@link AbstractIngestionFilter#filter} with a
 * capturing chain and asserts which requests the matcher gates. A gated request is wrapped in a
 * {@link ServerHttpRequestDecorator} before being passed down the chain (AbstractIngestionFilter.java:39);
 * a non-matching request is passed through untouched (AbstractIngestionFilter.java:38). The lazy
 * token check lives inside the decorator's {@code getBody()}, so a chain that does not read the body
 * never triggers it — letting us assert pure path/method coverage without a DB or a token.</p>
 *
 * @pins PLT-003 (ingestion-filter path-coverage incomplete)
 * Flip protocol (LSN-029): this is a GREEN characterization pin of the CURRENT incomplete coverage.
 * When PLT-003 is fixed — the matcher widened to all {@code /ingestion/**} write paths (or a single
 * filter mounted across them) — the two {@code isFalse()} assertions on the stats/metrics paths flip
 * to {@code isTrue()}. At that point invert this test to assert full coverage and drop the @pins tag.
 */
class IngestionFilterPathCoverageTest {

    /** True iff {@code filter} matched the request (and therefore wrapped it for downstream auth). */
    private static boolean gates(final AbstractIngestionFilter filter, final MockServerHttpRequest request) {
        final AtomicReference<ServerWebExchange> seen = new AtomicReference<>();
        final WebFilterChain capturingChain = exchange -> {
            seen.set(exchange);
            return Mono.empty();
        };
        filter.filter(MockServerWebExchange.from(request), capturingChain).block();
        return seen.get().getRequest() instanceof ServerHttpRequestDecorator;
    }

    @Test
    @DisplayName("UC-02/PLT-003: the entities ingestion filter gates ONLY POST /ingestion/entities — "
        + "stats + metrics write siblings are left unauthenticated")
    void ingestionDataEntitiesFilterGatesOnlyItsExactPath() {
        final AbstractIngestionFilter filter = new IngestionDataEntitiesFilter(
            mock(ReactiveDataSourceRepository.class), mock(ReactiveCollectorRepository.class));

        // The single path this filter actually gates.
        assertThat(gates(filter, MockServerHttpRequest.post("/ingestion/entities").build())).isTrue();

        // PLT-003: real ingestion WRITE siblings that the flag does NOT protect.
        assertThat(gates(filter, MockServerHttpRequest.post("/ingestion/entities/datasets/stats").build()))
            .isFalse();
        assertThat(gates(filter, MockServerHttpRequest.post("/ingestion/metrics").build())).isFalse();

        // Method-scoped: a GET to the gated path is not matched (the matcher binds POST).
        assertThat(gates(filter, MockServerHttpRequest.get("/ingestion/entities").build())).isFalse();
    }

    @Test
    @DisplayName("UC-02 (asymmetry): the datasource ingestion filter gates ONLY POST /ingestion/datasources")
    void ingestionDataSourceFilterGatesOnlyItsExactPath() {
        final AbstractIngestionFilter filter =
            new IngestionDataSourceFilter(mock(ReactiveCollectorRepository.class));

        assertThat(gates(filter, MockServerHttpRequest.post("/ingestion/datasources").build())).isTrue();

        // It does not cover the entities path (that is the conditional sibling filter's job) ...
        assertThat(gates(filter, MockServerHttpRequest.post("/ingestion/entities").build())).isFalse();
        // ... nor a GET to its own path.
        assertThat(gates(filter, MockServerHttpRequest.get("/ingestion/datasources").build())).isFalse();
    }
}
