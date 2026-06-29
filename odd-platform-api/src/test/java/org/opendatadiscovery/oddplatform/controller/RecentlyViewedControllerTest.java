package org.opendatadiscovery.oddplatform.controller;

import java.time.OffsetDateTime;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.opendatadiscovery.oddplatform.api.contract.model.AssetKind;
import org.opendatadiscovery.oddplatform.api.contract.model.AssetRef;
import org.opendatadiscovery.oddplatform.api.contract.model.PageInfo;
import org.opendatadiscovery.oddplatform.api.contract.model.RecentlyViewedAssetList;
import org.opendatadiscovery.oddplatform.api.contract.model.RecentlyViewedRef;
import org.opendatadiscovery.oddplatform.service.RecentlyViewedService;
import org.springframework.http.HttpStatus;
import org.springframework.mock.http.server.reactive.MockServerHttpRequest;
import org.springframework.mock.web.server.MockServerWebExchange;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * BEHAVIORAL unit test for RecentlyViewedController (issue #1816): the controller delegates to the service and
 * maps the result to the documented HTTP contract — 204 No Content for record/remove, 200 with the
 * viewed-subset body for the batch status, 200 with the list body. The service is mocked.
 */
@ExtendWith(MockitoExtension.class)
class RecentlyViewedControllerTest {

    @Mock private RecentlyViewedService recentlyViewedService;

    private RecentlyViewedController controller;

    @BeforeEach
    void setUp() {
        controller = new RecentlyViewedController(recentlyViewedService);
    }

    @Test
    void record_delegatesAndReturns204() {
        when(recentlyViewedService.recordView(AssetKind.DATA_ENTITY, 5L)).thenReturn(Mono.empty());

        StepVerifier.create(controller.recordRecentlyViewed(AssetKind.DATA_ENTITY, 5L, exchange()))
            .assertNext(response -> assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT))
            .verifyComplete();
        verify(recentlyViewedService).recordView(AssetKind.DATA_ENTITY, 5L);
    }

    @Test
    void remove_delegatesAndReturns204() {
        when(recentlyViewedService.removeRecentlyViewed(AssetKind.QUERY_EXAMPLE, 8L)).thenReturn(Mono.empty());

        StepVerifier.create(controller.removeRecentlyViewed(AssetKind.QUERY_EXAMPLE, 8L, exchange()))
            .assertNext(response -> assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT))
            .verifyComplete();
        verify(recentlyViewedService).removeRecentlyViewed(AssetKind.QUERY_EXAMPLE, 8L);
    }

    @Test
    void status_delegatesAndReturns200WithTheViewedSubset() {
        final RecentlyViewedRef ref = new RecentlyViewedRef()
            .assetKind(AssetKind.TERM).assetId(9L)
            .lastViewedAt(OffsetDateTime.parse("2026-06-29T10:00:00Z"));
        when(recentlyViewedService.getRecentlyViewedStatus(any())).thenReturn(Flux.just(ref));

        StepVerifier.create(controller.getRecentlyViewedStatus(Flux.just(new AssetRef(AssetKind.TERM, 9L)), exchange()))
            .assertNext(response -> {
                assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
                StepVerifier.create(response.getBody()).expectNext(ref).verifyComplete();
            })
            .verifyComplete();
    }

    @Test
    void list_delegatesAndReturns200() {
        final RecentlyViewedAssetList list = new RecentlyViewedAssetList()
            .items(List.of())
            .pageInfo(new PageInfo().total(0L).hasNext(false));
        when(recentlyViewedService.getRecentlyViewedList(null, null, null, 1, 20)).thenReturn(Mono.just(list));

        StepVerifier.create(controller.getRecentlyViewedList(1, 20, null, null, null, exchange()))
            .assertNext(response -> {
                assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
                assertThat(response.getBody()).isSameAs(list);
            })
            .verifyComplete();
        verify(recentlyViewedService).getRecentlyViewedList(null, null, null, 1, 20);
    }

    private static MockServerWebExchange exchange() {
        return MockServerWebExchange.from(MockServerHttpRequest.get("/"));
    }
}
