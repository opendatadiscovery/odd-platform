package org.opendatadiscovery.oddplatform.service;

import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.opendatadiscovery.oddplatform.api.contract.model.AssetKind;
import org.opendatadiscovery.oddplatform.api.contract.model.AssetRef;
import org.opendatadiscovery.oddplatform.auth.CurrentUserIdentityResolver;
import org.opendatadiscovery.oddplatform.dto.AssetRefDto;
import org.opendatadiscovery.oddplatform.dto.security.UserDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.FavoritePojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveFavoriteRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

/**
 * BEHAVIORAL unit test for FavoriteServiceImpl (issue #1815 / ADR D1, D5): every operation resolves the
 * caller identity from the security context (never a request parameter), the star is idempotent set-state,
 * and the batch status returns only the favorited subset. Identity + repository are mocked; the reactive
 * orchestration is exercised with StepVerifier.
 */
@ExtendWith(MockitoExtension.class)
class FavoriteServiceImplTest {

    @Mock private CurrentUserIdentityResolver currentUserIdentityResolver;
    @Mock private ReactiveFavoriteRepository favoriteRepository;

    private FavoriteServiceImpl service;

    @BeforeEach
    void setUp() {
        service = new FavoriteServiceImpl(currentUserIdentityResolver, favoriteRepository);
    }

    @Test
    void addFavorite_resolvesIdentityAndMarksWithTheKindString() {
        when(currentUserIdentityResolver.resolve()).thenReturn(Mono.just(new UserDto("alice", "google")));
        when(favoriteRepository.markFavorite("alice", "google", "DATA_ENTITY", 42L)).thenReturn(Mono.empty());

        StepVerifier.create(service.addFavorite(AssetKind.DATA_ENTITY, 42L))
            .verifyComplete();
        verify(favoriteRepository).markFavorite("alice", "google", "DATA_ENTITY", 42L);
    }

    @Test
    void removeFavorite_resolvesIdentityAndUnmarks() {
        when(currentUserIdentityResolver.resolve()).thenReturn(Mono.just(new UserDto("alice", "google")));
        when(favoriteRepository.unmarkFavorite("alice", "google", "TERM", 7L)).thenReturn(Mono.empty());

        StepVerifier.create(service.removeFavorite(AssetKind.TERM, 7L))
            .verifyComplete();
        verify(favoriteRepository).unmarkFavorite("alice", "google", "TERM", 7L);
    }

    @Test
    void getFavoriteStatus_queriesTheAskedRefsAndReturnsOnlyTheFavoritedSubset() {
        when(currentUserIdentityResolver.resolve()).thenReturn(Mono.just(new UserDto("alice", "google")));
        when(favoriteRepository.getFavorited(eq("alice"), eq("google"),
                eq(List.of(new AssetRefDto("DATA_ENTITY", 1L), new AssetRefDto("TERM", 2L)))))
            .thenReturn(Flux.just(new FavoritePojo(1L, "alice", "google", "DATA_ENTITY", 1L, null, null)));

        StepVerifier.create(service.getFavoriteStatus(Flux.just(
                new AssetRef(AssetKind.DATA_ENTITY, 1L),
                new AssetRef(AssetKind.TERM, 2L))))
            .assertNext(ref -> {
                assertThat(ref.getAssetKind()).isEqualTo(AssetKind.DATA_ENTITY);
                assertThat(ref.getAssetId()).isEqualTo(1L);
            })
            .verifyComplete();
    }

    @Test
    void getFavoriteStatus_emptyInput_shortCircuitsWithoutResolvingOrQuerying() {
        StepVerifier.create(service.getFavoriteStatus(Flux.empty()))
            .verifyComplete();
        verifyNoInteractions(currentUserIdentityResolver, favoriteRepository);
    }
}
