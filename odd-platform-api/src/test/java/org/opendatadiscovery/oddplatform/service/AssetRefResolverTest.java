package org.opendatadiscovery.oddplatform.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.opendatadiscovery.oddplatform.api.contract.model.AssetKind;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityRef;
import org.opendatadiscovery.oddplatform.api.contract.model.QueryExampleRef;
import org.opendatadiscovery.oddplatform.api.contract.model.TermRef;
import org.opendatadiscovery.oddplatform.dto.AssetRefDto;
import org.opendatadiscovery.oddplatform.dto.DataEntityDimensionsDto;
import org.opendatadiscovery.oddplatform.dto.term.TermRefDto;
import org.opendatadiscovery.oddplatform.mapper.DataEntityMapper;
import org.opendatadiscovery.oddplatform.mapper.QueryExampleMapper;
import org.opendatadiscovery.oddplatform.mapper.TermMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.QueryExamplePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TermPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataEntityRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveQueryExampleRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveTermRepository;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

/**
 * BEHAVIORAL unit test for the SHARED polymorphic resolver {@link AssetRefResolver} (issue #1815/#1816, ADR
 * D3/D4): resolves {@code (kind, id)} pairs into per-kind refs across the 3 kinds and inherits each kind's
 * visibility — a deleted/hollow asset is absent from the result map. The per-kind repos + ref mappers are
 * mocked. Ordering + per-row metadata are the adapters' concern (see FavoriteAssetResolverTest /
 * RecentlyViewedAssetResolverTest), so this test asserts the resolved-by-key map only.
 */
@ExtendWith(MockitoExtension.class)
class AssetRefResolverTest {

    @Mock private ReactiveDataEntityRepository dataEntityRepository;
    @Mock private DataEntityMapper dataEntityMapper;
    @Mock private ReactiveTermRepository termRepository;
    @Mock private TermMapper termMapper;
    @Mock private ReactiveQueryExampleRepository queryExampleRepository;
    @Mock private QueryExampleMapper queryExampleMapper;

    private AssetRefResolver resolver;

    @BeforeEach
    void setUp() {
        resolver = new AssetRefResolver(dataEntityRepository, dataEntityMapper,
            termRepository, termMapper, queryExampleRepository, queryExampleMapper);
    }

    @Test
    void resolveByKey_empty_returnsEmptyWithoutQuerying() {
        StepVerifier.create(resolver.resolveByKey(List.of()))
            .assertNext(map -> assertThat(map).isEmpty())
            .verifyComplete();
        verifyNoInteractions(dataEntityRepository, termRepository, queryExampleRepository);
    }

    @Test
    void resolveByKey_dataEntity_visible_mapsToRef() {
        final DataEntityDimensionsDto dto = dimensions(10L, (short) 1, false);
        final DataEntityRef ref = mock(DataEntityRef.class);
        when(dataEntityRepository.getDimensionsByIds(Set.of(10L))).thenReturn(Mono.just(List.of(dto)));
        when(dataEntityMapper.mapRef(dto)).thenReturn(ref);

        StepVerifier.create(resolver.resolveByKey(List.of(new AssetRefDto("DATA_ENTITY", 10L))))
            .assertNext(map -> {
                final AssetRefResolver.ResolvedAsset r = map.get("DATA_ENTITY:10");
                assertThat(r).isNotNull();
                assertThat(r.assetKind()).isEqualTo(AssetKind.DATA_ENTITY);
                assertThat(r.dataEntity()).isSameAs(ref);
            })
            .verifyComplete();
    }

    @Test
    void resolveByKey_dropsDeletedAndHollowDataEntities() {
        final DataEntityDimensionsDto deleted = dimensions(11L, (short) 5, false); // DELETED status id = 5
        final DataEntityDimensionsDto hollow = dimensions(12L, (short) 1, true);
        when(dataEntityRepository.getDimensionsByIds(Set.of(11L, 12L)))
            .thenReturn(Mono.just(List.of(deleted, hollow)));

        StepVerifier.create(resolver.resolveByKey(
                List.of(new AssetRefDto("DATA_ENTITY", 11L), new AssetRefDto("DATA_ENTITY", 12L))))
            .assertNext(map -> assertThat(map).isEmpty())
            .verifyComplete();
    }

    @Test
    void resolveByKey_term_mapsToRef() {
        final TermRefDto dto = mock(TermRefDto.class);
        when(dto.getTerm()).thenReturn(new TermPojo().setId(20L));
        final TermRef ref = mock(TermRef.class);
        when(termRepository.getTermRefDto(20L)).thenReturn(Mono.just(dto));
        when(termMapper.mapToRef(dto)).thenReturn(ref);

        StepVerifier.create(resolver.resolveByKey(List.of(new AssetRefDto("TERM", 20L))))
            .assertNext(map -> {
                final AssetRefResolver.ResolvedAsset r = map.get("TERM:20");
                assertThat(r.assetKind()).isEqualTo(AssetKind.TERM);
                assertThat(r.term()).isSameAs(ref);
            })
            .verifyComplete();
    }

    @Test
    void resolveByKey_queryExample_dropsDeleted() {
        final QueryExamplePojo active = new QueryExamplePojo().setId(30L);
        final QueryExamplePojo deleted = new QueryExamplePojo().setId(31L).setDeletedAt(LocalDateTime.now());
        final QueryExampleRef ref = mock(QueryExampleRef.class);
        when(queryExampleRepository.get(30L)).thenReturn(Mono.just(active));
        when(queryExampleRepository.get(31L)).thenReturn(Mono.just(deleted));
        when(queryExampleMapper.mapToQueryExampleRef(active)).thenReturn(ref);

        StepVerifier.create(resolver.resolveByKey(
                List.of(new AssetRefDto("QUERY_EXAMPLE", 30L), new AssetRefDto("QUERY_EXAMPLE", 31L))))
            .assertNext(map -> {
                assertThat(map).hasSize(1);
                assertThat(map.get("QUERY_EXAMPLE:30").queryExample()).isSameAs(ref);
            })
            .verifyComplete();
    }

    @Test
    void resolveByKey_dedupsDuplicateRowsDefensively() {
        // getDimensionsByIds normally returns one row per id; if it ever returned duplicates, the resolver
        // must keep a single entry rather than emit two for one reference.
        final DataEntityDimensionsDto first = dimensions(50L, (short) 1, false);
        final DataEntityDimensionsDto second = dimensions(50L, (short) 1, false);
        when(dataEntityRepository.getDimensionsByIds(Set.of(50L))).thenReturn(Mono.just(List.of(first, second)));
        when(dataEntityMapper.mapRef(first)).thenReturn(mock(DataEntityRef.class));
        when(dataEntityMapper.mapRef(second)).thenReturn(mock(DataEntityRef.class));

        StepVerifier.create(resolver.resolveByKey(List.of(new AssetRefDto("DATA_ENTITY", 50L))))
            .assertNext(map -> assertThat(map).hasSize(1))
            .verifyComplete();
    }

    private static DataEntityDimensionsDto dimensions(final long id, final short status, final boolean hollow) {
        final DataEntityDimensionsDto dto = mock(DataEntityDimensionsDto.class);
        when(dto.getDataEntity()).thenReturn(new DataEntityPojo().setId(id).setStatus(status).setHollow(hollow));
        return dto;
    }
}
