package org.opendatadiscovery.oddplatform.controller;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.opendatadiscovery.oddplatform.api.contract.model.AssetKind;
import org.opendatadiscovery.oddplatform.api.contract.model.AssetRef;
import org.opendatadiscovery.oddplatform.service.FavoriteService;
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
 * BEHAVIORAL unit test for FavoriteController (issue #1815): the controller delegates to the service and
 * maps the result to the documented HTTP contract — 204 No Content for the idempotent star/un-star,
 * 200 with the favorited-subset body for the batch status. The service is mocked.
 */
@ExtendWith(MockitoExtension.class)
class FavoriteControllerTest {

    @Mock private FavoriteService favoriteService;

    private FavoriteController controller;

    @BeforeEach
    void setUp() {
        controller = new FavoriteController(favoriteService);
    }

    @Test
    void addFavorite_delegatesAndReturns204() {
        when(favoriteService.addFavorite(AssetKind.DATA_ENTITY, 5L)).thenReturn(Mono.empty());

        StepVerifier.create(controller.addFavorite(AssetKind.DATA_ENTITY, 5L, exchange()))
            .assertNext(response -> assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT))
            .verifyComplete();
        verify(favoriteService).addFavorite(AssetKind.DATA_ENTITY, 5L);
    }

    @Test
    void removeFavorite_delegatesAndReturns204() {
        when(favoriteService.removeFavorite(AssetKind.QUERY_EXAMPLE, 8L)).thenReturn(Mono.empty());

        StepVerifier.create(controller.removeFavorite(AssetKind.QUERY_EXAMPLE, 8L, exchange()))
            .assertNext(response -> assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT))
            .verifyComplete();
        verify(favoriteService).removeFavorite(AssetKind.QUERY_EXAMPLE, 8L);
    }

    @Test
    void getFavoriteStatus_delegatesAndReturns200WithTheFavoritedSubset() {
        final AssetRef favored = new AssetRef(AssetKind.TERM, 9L);
        when(favoriteService.getFavoriteStatus(any())).thenReturn(Flux.just(favored));

        StepVerifier.create(controller.getFavoriteStatus(Flux.just(favored), exchange()))
            .assertNext(response -> {
                assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
                StepVerifier.create(response.getBody())
                    .expectNext(favored)
                    .verifyComplete();
            })
            .verifyComplete();
    }

    private static MockServerWebExchange exchange() {
        return MockServerWebExchange.from(MockServerHttpRequest.get("/"));
    }
}
