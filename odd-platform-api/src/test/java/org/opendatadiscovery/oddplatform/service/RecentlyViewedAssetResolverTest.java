package org.opendatadiscovery.oddplatform.service;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.opendatadiscovery.oddplatform.api.contract.model.AssetKind;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityRef;
import org.opendatadiscovery.oddplatform.api.contract.model.TermRef;
import org.opendatadiscovery.oddplatform.dto.AssetRefDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.RecentlyViewedPojo;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

/**
 * BEHAVIORAL unit test for RecentlyViewedAssetResolver (issue #1816): maps the shared resolver's output into
 * {@link org.opendatadiscovery.oddplatform.api.contract.model.RecentlyViewedAsset} items, preserves the
 * most-recent-first page order, attaches each row's last_viewed_at, and drops rows that did not resolve
 * (deleted assets). The shared {@link AssetRefResolver} is mocked.
 */
@ExtendWith(MockitoExtension.class)
class RecentlyViewedAssetResolverTest {

    @Mock private AssetRefResolver assetRefResolver;

    private RecentlyViewedAssetResolver resolver;

    @BeforeEach
    void setUp() {
        resolver = new RecentlyViewedAssetResolver(assetRefResolver);
    }

    @Test
    void resolve_emptyPage_returnsEmptyWithoutResolving() {
        StepVerifier.create(resolver.resolve(List.of()))
            .assertNext(items -> assertThat(items).isEmpty())
            .verifyComplete();
        verifyNoInteractions(assetRefResolver);
    }

    @Test
    void resolve_mapsAttachesTimestampPreservesOrder_andDropsUnresolved() {
        final DataEntityRef deRef = mock(DataEntityRef.class);
        final TermRef termRef = mock(TermRef.class);
        final LocalDateTime t1 = LocalDateTime.of(2026, 6, 29, 10, 0);
        final LocalDateTime t2 = LocalDateTime.of(2026, 6, 28, 9, 0);
        final LocalDateTime t3 = LocalDateTime.of(2026, 6, 27, 8, 0);
        when(assetRefResolver.resolveByKey(List.of(
                new AssetRefDto("TERM", 41L),
                new AssetRefDto("DATA_ENTITY", 40L),
                new AssetRefDto("QUERY_EXAMPLE", 99L))))   // 99 not resolved -> dropped
            .thenReturn(Mono.just(Map.of(
                "TERM:41", new AssetRefResolver.ResolvedAsset(AssetKind.TERM, null, termRef, null),
                "DATA_ENTITY:40", new AssetRefResolver.ResolvedAsset(AssetKind.DATA_ENTITY, deRef, null, null))));

        StepVerifier.create(resolver.resolve(List.of(
                rv("TERM", 41L, t1), rv("DATA_ENTITY", 40L, t2), rv("QUERY_EXAMPLE", 99L, t3))))
            .assertNext(items -> {
                assertThat(items).hasSize(2);
                assertThat(items.get(0).getAssetKind()).isEqualTo(AssetKind.TERM);
                assertThat(items.get(0).getTerm()).isSameAs(termRef);
                assertThat(items.get(0).getLastViewedAt()).isEqualTo(t1.atOffset(ZoneOffset.UTC));
                assertThat(items.get(1).getAssetKind()).isEqualTo(AssetKind.DATA_ENTITY);
                assertThat(items.get(1).getDataEntity()).isSameAs(deRef);
                assertThat(items.get(1).getLastViewedAt()).isEqualTo(t2.atOffset(ZoneOffset.UTC));
            })
            .verifyComplete();
    }

    private static RecentlyViewedPojo rv(final String kind, final long id, final LocalDateTime ts) {
        return new RecentlyViewedPojo().setAssetKind(kind).setAssetId(id).setLastViewedAt(ts);
    }
}
