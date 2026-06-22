package org.opendatadiscovery.oddplatform.auth.filter;

import java.util.concurrent.atomic.AtomicBoolean;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.model.tables.pojos.CollectorPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataSourcePojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveCollectorRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataSourceRepository;
import org.springframework.http.HttpHeaders;
import org.springframework.mock.http.server.reactive.MockServerHttpRequest;
import org.springframework.mock.web.server.MockServerWebExchange;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

/**
 * F-008 / PLT-003 / odd-platform #1740 — full-coverage proof for the uniform ingestion authentication gate.
 *
 * <p>{@link IngestionAuthenticationFilter} closes the path-coverage gap characterised by
 * {@link IngestionFilterPathCoverageTest}: when {@code auth.ingestion.filter.enabled=true} it requires a
 * registered collector- or datasource-Bearer token on every {@code /ingestion/**} route EXCEPT the two that
 * already have a dedicated filter ({@code /ingestion/entities}, {@code /ingestion/datasources}) and the
 * third-party Alertmanager webhook ({@code /ingestion/alert/**}). The check is eager, so it also covers the
 * body-less {@code GET /ingestion/entities/degs/children} read that a body-decorator filter would miss.</p>
 */
class IngestionAuthenticationFilterTest {

    private final ReactiveCollectorRepository collectorRepository = mock(ReactiveCollectorRepository.class);
    private final ReactiveDataSourceRepository dataSourceRepository = mock(ReactiveDataSourceRepository.class);
    private final IngestionAuthenticationFilter filter =
        new IngestionAuthenticationFilter(collectorRepository, dataSourceRepository);

    private record Outcome(boolean chainCalled, Integer status) {
    }

    /** Drives the filter and reports whether the chain ran and the response status the filter set (null if unset). */
    private Outcome run(final MockServerHttpRequest request) {
        final AtomicBoolean chainCalled = new AtomicBoolean(false);
        final WebFilterChain chain = exchange -> {
            chainCalled.set(true);
            return Mono.empty();
        };
        final MockServerWebExchange exchange = MockServerWebExchange.from(request);
        filter.filter(exchange, chain).block();
        final var status = exchange.getResponse().getStatusCode();
        return new Outcome(chainCalled.get(), status == null ? null : status.value());
    }

    @Test
    @DisplayName("#1740: a tokenless POST to every previously-uncovered ingestion route is rejected 401")
    void tokenlessUncoveredRoutesRejected() {
        final String[] paths = {
            "/ingestion/entities/datasets/stats", "/ingestion/metrics", "/ingestion/alert/alertmanager",
        };
        for (final String path : paths) {
            final Outcome o = run(MockServerHttpRequest.post(path).build());
            assertThat(o.chainCalled()).as(path).isFalse();
            assertThat(o.status()).as(path).isEqualTo(401);
        }
    }

    @Test
    @DisplayName("#1740: the body-less GET DEG-children read is gated too (eager check, not a body decorator)")
    void tokenlessDegChildrenGetRejected() {
        final Outcome o = run(MockServerHttpRequest.get("/ingestion/entities/degs/children").build());
        assertThat(o.chainCalled()).isFalse();
        assertThat(o.status()).isEqualTo(401);
    }

    @Test
    @DisplayName("#1740: a registered collector token authenticates the request")
    void validCollectorTokenPasses() {
        when(collectorRepository.getByToken(anyString())).thenReturn(Mono.just(new CollectorPojo()));
        final Outcome o = run(MockServerHttpRequest.post("/ingestion/metrics")
            .header(HttpHeaders.AUTHORIZATION, "Bearer good-collector").build());
        assertThat(o.chainCalled()).isTrue();
        assertThat(o.status()).isNull();
    }

    @Test
    @DisplayName("#1740: a registered datasource token authenticates the request (collector miss -> datasource)")
    void validDataSourceTokenPasses() {
        when(collectorRepository.getByToken(anyString())).thenReturn(Mono.empty());
        when(dataSourceRepository.getByToken(anyString())).thenReturn(Mono.just(new DataSourcePojo()));
        final Outcome o = run(MockServerHttpRequest.post("/ingestion/metrics")
            .header(HttpHeaders.AUTHORIZATION, "Bearer good-datasource").build());
        assertThat(o.chainCalled()).isTrue();
        assertThat(o.status()).isNull();
    }

    @Test
    @DisplayName("#1740: an unknown Bearer token is rejected 401")
    void unknownTokenRejected() {
        when(collectorRepository.getByToken(anyString())).thenReturn(Mono.empty());
        when(dataSourceRepository.getByToken(anyString())).thenReturn(Mono.empty());
        final Outcome o = run(MockServerHttpRequest.post("/ingestion/metrics")
            .header(HttpHeaders.AUTHORIZATION, "Bearer nope").build());
        assertThat(o.chainCalled()).isFalse();
        assertThat(o.status()).isEqualTo(401);
    }

    @Test
    @DisplayName("#1740: a non-Bearer Authorization header is rejected 401")
    void nonBearerHeaderRejected() {
        final Outcome o = run(MockServerHttpRequest.post("/ingestion/metrics")
            .header(HttpHeaders.AUTHORIZATION, "Basic dXNlcjpwYXNz").build());
        assertThat(o.chainCalled()).isFalse();
        assertThat(o.status()).isEqualTo(401);
    }

    @Test
    @DisplayName("#1740: the two dedicated-filter paths are excluded from the uniform filter (passed through)")
    void excludedPathsPassThrough() {
        final String[] excluded = {"/ingestion/entities", "/ingestion/datasources"};
        for (final String path : excluded) {
            final Outcome o = run(MockServerHttpRequest.post(path).build());
            assertThat(o.chainCalled()).as(path).isTrue();
            assertThat(o.status()).as(path).isNull();
        }
    }
}
