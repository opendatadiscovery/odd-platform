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
 * F-008-UC-02 / PLT-003 (RESOLVED, odd-platform #1740) — the two per-resource ingestion filters are
 * exact-path BY DESIGN; the breadth is now provided by {@link IngestionAuthenticationFilter}.
 *
 * <p>Each {@link AbstractIngestionFilter} subclass is wired with a
 * {@code PathPatternParserServerWebExchangeMatcher} bound to ONE exact path —
 * {@link IngestionDataEntitiesFilter} gates {@code POST /ingestion/entities} (it carries the per-datasource
 * authorization that needs the request body), and {@link IngestionDataSourceFilter} gates
 * {@code POST /ingestion/datasources} (the collector-registration binding). Neither covers the sibling
 * write/read routes — and that is correct: PLT-003 is closed NOT by widening these matchers but by mounting
 * one uniform {@link IngestionAuthenticationFilter} across {@code /ingestion/**} (the full-coverage proof is
 * {@link IngestionAuthenticationFilterTest}). This test pins the NARROWNESS of the two per-resource filters,
 * so a future change that quietly broadened one — double-gating a path the uniform filter already owns — is
 * caught.</p>
 *
 * <p>It drives the REAL filter beans through {@link AbstractIngestionFilter#filter} with a capturing chain:
 * a gated request is wrapped in a {@link ServerHttpRequestDecorator} before being passed down
 * (AbstractIngestionFilter.java:39); a non-matching request is passed through untouched
 * (AbstractIngestionFilter.java:38). The lazy token check lives inside the decorator's {@code getBody()}, so
 * a chain that does not read the body never triggers it — letting us assert pure path/method coverage
 * without a DB or a token.</p>
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
    @DisplayName("#1740: the entities ingestion filter gates ONLY POST /ingestion/entities — its stats + "
        + "metrics siblings are covered by the uniform IngestionAuthenticationFilter, not this filter")
    void ingestionDataEntitiesFilterGatesOnlyItsExactPath() {
        final AbstractIngestionFilter filter = new IngestionDataEntitiesFilter(
            mock(ReactiveDataSourceRepository.class), mock(ReactiveCollectorRepository.class));

        // The single path this filter actually gates.
        assertThat(gates(filter, MockServerHttpRequest.post("/ingestion/entities").build())).isTrue();

        // The entities filter is exact-path BY DESIGN: these siblings are NOT gated HERE — the uniform
        // IngestionAuthenticationFilter authenticates them (see IngestionAuthenticationFilterTest).
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
