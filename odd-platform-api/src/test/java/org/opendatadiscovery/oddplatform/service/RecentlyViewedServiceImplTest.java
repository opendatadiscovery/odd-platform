package org.opendatadiscovery.oddplatform.service;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.opendatadiscovery.oddplatform.api.contract.model.AssetKind;
import org.opendatadiscovery.oddplatform.api.contract.model.AssetRef;
import org.opendatadiscovery.oddplatform.api.contract.model.RecentlyViewedAsset;
import org.opendatadiscovery.oddplatform.auth.CurrentUserIdentityResolver;
import org.opendatadiscovery.oddplatform.dto.AssetRefDto;
import org.opendatadiscovery.oddplatform.dto.security.UserDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.RecentlyViewedPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveRecentlyViewedRepository;
import org.opendatadiscovery.oddplatform.service.ingestion.util.DateTimeUtil;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

/**
 * BEHAVIORAL unit test for RecentlyViewedServiceImpl (issue #1816 / PRD-0001 §6.2): every operation resolves
 * the caller identity from the security context (never a request parameter), so a user only ever records,
 * reads, or removes their OWN {@code (username, provider)} bucket; under DISABLED auth the shared sentinel
 * bucket is used. Identity + repository are mocked; the reactive orchestration is exercised with StepVerifier.
 */
@ExtendWith(MockitoExtension.class)
class RecentlyViewedServiceImplTest {

    @Mock private CurrentUserIdentityResolver currentUserIdentityResolver;
    @Mock private ReactiveRecentlyViewedRepository recentlyViewedRepository;
    @Mock private RecentlyViewedAssetResolver recentlyViewedAssetResolver;

    private RecentlyViewedServiceImpl service;

    @BeforeEach
    void setUp() {
        service = new RecentlyViewedServiceImpl(
            currentUserIdentityResolver, recentlyViewedRepository, recentlyViewedAssetResolver);
    }

    @Test
    void recordView_resolvesIdentityAndRecordsWithTheKindString() {
        when(currentUserIdentityResolver.resolve()).thenReturn(Mono.just(new UserDto("alice", "google")));
        when(recentlyViewedRepository.recordView("alice", "google", "DATA_ENTITY", 42L)).thenReturn(Mono.empty());

        StepVerifier.create(service.recordView(AssetKind.DATA_ENTITY, 42L)).verifyComplete();
        verify(recentlyViewedRepository).recordView("alice", "google", "DATA_ENTITY", 42L);
    }

    @Test
    void removeRecentlyViewed_isScopedToTheResolvedIdentity_neverAnotherUser() {
        // Security: the delete is keyed on the security-context identity, so alice can only delete alice's row.
        when(currentUserIdentityResolver.resolve()).thenReturn(Mono.just(new UserDto("alice", "google")));
        when(recentlyViewedRepository.removeRecentlyViewed("alice", "google", "TERM", 7L)).thenReturn(Mono.empty());

        StepVerifier.create(service.removeRecentlyViewed(AssetKind.TERM, 7L)).verifyComplete();
        verify(recentlyViewedRepository).removeRecentlyViewed("alice", "google", "TERM", 7L);
    }

    @Test
    void removeRecentlyViewed_underDisabledAuth_targetsTheSharedBucket() {
        when(currentUserIdentityResolver.resolve()).thenReturn(Mono.just(new UserDto(
            CurrentUserIdentityResolver.SHARED_USERNAME, CurrentUserIdentityResolver.SHARED_PROVIDER)));
        when(recentlyViewedRepository.removeRecentlyViewed("__shared__", "DISABLED", "DATA_ENTITY", 5L))
            .thenReturn(Mono.empty());

        StepVerifier.create(service.removeRecentlyViewed(AssetKind.DATA_ENTITY, 5L)).verifyComplete();
        verify(recentlyViewedRepository).removeRecentlyViewed("__shared__", "DISABLED", "DATA_ENTITY", 5L);
    }

    @Test
    void getRecentlyViewedStatus_returnsTheViewedSubsetWithTimestamps() {
        when(currentUserIdentityResolver.resolve()).thenReturn(Mono.just(new UserDto("alice", "google")));
        final LocalDateTime ts = LocalDateTime.of(2026, 6, 29, 10, 0);
        when(recentlyViewedRepository.getRecentlyViewed(eq("alice"), eq("google"),
                eq(List.of(new AssetRefDto("DATA_ENTITY", 1L), new AssetRefDto("TERM", 2L)))))
            .thenReturn(Flux.just(new RecentlyViewedPojo()
                .setAssetKind("DATA_ENTITY").setAssetId(1L).setLastViewedAt(ts)));

        StepVerifier.create(service.getRecentlyViewedStatus(Flux.just(
                new AssetRef(AssetKind.DATA_ENTITY, 1L),
                new AssetRef(AssetKind.TERM, 2L))))
            .assertNext(ref -> {
                assertThat(ref.getAssetKind()).isEqualTo(AssetKind.DATA_ENTITY);
                assertThat(ref.getAssetId()).isEqualTo(1L);
                assertThat(ref.getLastViewedAt()).isEqualTo(ts.atOffset(ZoneOffset.UTC));
            })
            .verifyComplete();
    }

    @Test
    void getRecentlyViewedStatus_emptyInput_shortCircuitsWithoutResolvingOrQuerying() {
        StepVerifier.create(service.getRecentlyViewedStatus(Flux.empty())).verifyComplete();
        verifyNoInteractions(currentUserIdentityResolver, recentlyViewedRepository);
    }

    @Test
    void getRecentlyViewedList_resolvesThePageAndBuildsPageInfo() {
        when(currentUserIdentityResolver.resolve()).thenReturn(Mono.just(new UserDto("alice", "google")));
        final List<RecentlyViewedPojo> page =
            List.of(new RecentlyViewedPojo().setAssetKind("DATA_ENTITY").setAssetId(1L));
        when(recentlyViewedRepository.getRecentlyViewedPage("alice", "google", List.of(), null, null, 0, 20))
            .thenReturn(Flux.fromIterable(page));
        when(recentlyViewedRepository.countRecentlyViewed("alice", "google", List.of(), null, null))
            .thenReturn(Mono.just(1L));
        final List<RecentlyViewedAsset> resolved =
            List.of(new RecentlyViewedAsset().assetKind(AssetKind.DATA_ENTITY));
        when(recentlyViewedAssetResolver.resolve(page)).thenReturn(Mono.just(resolved));

        StepVerifier.create(service.getRecentlyViewedList(null, null, null, 1, 20))
            .assertNext(list -> {
                assertThat(list.getItems()).isEqualTo(resolved);
                assertThat(list.getPageInfo().getTotal()).isEqualTo(1L);
                assertThat(list.getPageInfo().getHasNext()).isFalse();
            })
            .verifyComplete();
    }

    @Test
    void getRecentlyViewedList_capsSizeAt100_mapsKinds_andPassesTheDateWindow() {
        when(currentUserIdentityResolver.resolve()).thenReturn(Mono.just(new UserDto("alice", "google")));
        final OffsetDateTime after = OffsetDateTime.parse("2026-06-01T00:00:00Z");
        final OffsetDateTime before = OffsetDateTime.parse("2026-06-29T00:00:00Z");
        final LocalDateTime afterLocal = DateTimeUtil.mapUTCDateTime(after);
        final LocalDateTime beforeLocal = DateTimeUtil.mapUTCDateTime(before);
        when(recentlyViewedRepository.getRecentlyViewedPage(
                "alice", "google", List.of("TERM"), afterLocal, beforeLocal, 0, 100))
            .thenReturn(Flux.empty());
        when(recentlyViewedRepository.countRecentlyViewed(
                "alice", "google", List.of("TERM"), afterLocal, beforeLocal))
            .thenReturn(Mono.just(0L));
        when(recentlyViewedAssetResolver.resolve(List.of())).thenReturn(Mono.just(List.of()));

        StepVerifier.create(service.getRecentlyViewedList(List.of(AssetKind.TERM), after, before, 1, 500))
            .assertNext(list -> assertThat(list.getItems()).isEmpty())
            .verifyComplete();
        verify(recentlyViewedRepository)
            .getRecentlyViewedPage("alice", "google", List.of("TERM"), afterLocal, beforeLocal, 0, 100);
    }
}
