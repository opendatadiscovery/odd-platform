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
import org.opendatadiscovery.oddplatform.dto.DataEntityDimensionsDto;
import org.opendatadiscovery.oddplatform.dto.term.TermRefDto;
import org.opendatadiscovery.oddplatform.mapper.DataEntityMapper;
import org.opendatadiscovery.oddplatform.mapper.QueryExampleMapper;
import org.opendatadiscovery.oddplatform.mapper.TermMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.FavoritePojo;
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
 * BEHAVIORAL unit test for FavoriteAssetResolver (issue #1815 / ADR D3, D4): resolves a page of favorited
 * (kind, id) pairs into renderable assets across the 3 kinds, preserving the favorited order and inheriting
 * each kind's visibility — a deleted/hollow asset drops out. The per-kind repos + ref mappers are mocked.
 */
@ExtendWith(MockitoExtension.class)
class FavoriteAssetResolverTest {

    @Mock private ReactiveDataEntityRepository dataEntityRepository;
    @Mock private DataEntityMapper dataEntityMapper;
    @Mock private ReactiveTermRepository termRepository;
    @Mock private TermMapper termMapper;
    @Mock private ReactiveQueryExampleRepository queryExampleRepository;
    @Mock private QueryExampleMapper queryExampleMapper;

    private FavoriteAssetResolver resolver;

    @BeforeEach
    void setUp() {
        resolver = new FavoriteAssetResolver(dataEntityRepository, dataEntityMapper,
            termRepository, termMapper, queryExampleRepository, queryExampleMapper);
    }

    @Test
    void resolve_emptyPage_returnsEmptyWithoutQuerying() {
        StepVerifier.create(resolver.resolve(List.of()))
            .assertNext(items -> assertThat(items).isEmpty())
            .verifyComplete();
        verifyNoInteractions(dataEntityRepository, termRepository, queryExampleRepository);
    }

    @Test
    void resolve_dataEntity_visible_mapsToRef() {
        final DataEntityDimensionsDto dto = dimensions(10L, (short) 1, false);
        final DataEntityRef ref = mock(DataEntityRef.class);
        when(dataEntityRepository.getDimensionsByIds(Set.of(10L))).thenReturn(Mono.just(List.of(dto)));
        when(dataEntityMapper.mapRef(dto)).thenReturn(ref);

        StepVerifier.create(resolver.resolve(List.of(fav("DATA_ENTITY", 10L))))
            .assertNext(items -> {
                assertThat(items).hasSize(1);
                assertThat(items.get(0).getAssetKind()).isEqualTo(AssetKind.DATA_ENTITY);
                assertThat(items.get(0).getDataEntity()).isSameAs(ref);
            })
            .verifyComplete();
    }

    @Test
    void resolve_dropsDeletedAndHollowDataEntities() {
        final DataEntityDimensionsDto deleted = dimensions(11L, (short) 5, false); // DELETED status id = 5
        final DataEntityDimensionsDto hollow = dimensions(12L, (short) 1, true);
        when(dataEntityRepository.getDimensionsByIds(Set.of(11L, 12L)))
            .thenReturn(Mono.just(List.of(deleted, hollow)));

        StepVerifier.create(resolver.resolve(List.of(fav("DATA_ENTITY", 11L), fav("DATA_ENTITY", 12L))))
            .assertNext(items -> assertThat(items).isEmpty())
            .verifyComplete();
    }

    @Test
    void resolve_term_mapsToRef() {
        final TermRefDto dto = mock(TermRefDto.class);
        when(dto.getTerm()).thenReturn(new TermPojo().setId(20L));
        final TermRef ref = mock(TermRef.class);
        when(termRepository.getTermRefDto(20L)).thenReturn(Mono.just(dto));
        when(termMapper.mapToRef(dto)).thenReturn(ref);

        StepVerifier.create(resolver.resolve(List.of(fav("TERM", 20L))))
            .assertNext(items -> {
                assertThat(items).hasSize(1);
                assertThat(items.get(0).getAssetKind()).isEqualTo(AssetKind.TERM);
                assertThat(items.get(0).getTerm()).isSameAs(ref);
            })
            .verifyComplete();
    }

    @Test
    void resolve_queryExample_dropsDeleted() {
        final QueryExamplePojo active = new QueryExamplePojo().setId(30L);
        final QueryExamplePojo deleted = new QueryExamplePojo().setId(31L).setDeletedAt(LocalDateTime.now());
        final QueryExampleRef ref = mock(QueryExampleRef.class);
        when(queryExampleRepository.get(30L)).thenReturn(Mono.just(active));
        when(queryExampleRepository.get(31L)).thenReturn(Mono.just(deleted));
        when(queryExampleMapper.mapToQueryExampleRef(active)).thenReturn(ref);

        StepVerifier.create(resolver.resolve(List.of(fav("QUERY_EXAMPLE", 30L), fav("QUERY_EXAMPLE", 31L))))
            .assertNext(items -> {
                assertThat(items).hasSize(1);
                assertThat(items.get(0).getAssetKind()).isEqualTo(AssetKind.QUERY_EXAMPLE);
                assertThat(items.get(0).getQueryExample()).isSameAs(ref);
            })
            .verifyComplete();
    }

    @Test
    void resolve_preservesFavoritedOrderAcrossKinds() {
        final DataEntityDimensionsDto de = dimensions(40L, (short) 1, false);
        when(dataEntityRepository.getDimensionsByIds(Set.of(40L))).thenReturn(Mono.just(List.of(de)));
        when(dataEntityMapper.mapRef(de)).thenReturn(mock(DataEntityRef.class));
        final TermRefDto term = mock(TermRefDto.class);
        when(term.getTerm()).thenReturn(new TermPojo().setId(41L));
        when(termRepository.getTermRefDto(41L)).thenReturn(Mono.just(term));
        when(termMapper.mapToRef(term)).thenReturn(mock(TermRef.class));

        // favorited order: TERM(41) before DATA_ENTITY(40) — must be preserved in the result
        StepVerifier.create(resolver.resolve(List.of(fav("TERM", 41L), fav("DATA_ENTITY", 40L))))
            .assertNext(items -> {
                assertThat(items).hasSize(2);
                assertThat(items.get(0).getAssetKind()).isEqualTo(AssetKind.TERM);
                assertThat(items.get(1).getAssetKind()).isEqualTo(AssetKind.DATA_ENTITY);
            })
            .verifyComplete();
    }

    @Test
    void resolve_dedupsDuplicateRowsDefensively() {
        // getDimensionsByIds normally returns one row per id; if it ever returned duplicates, the resolver
        // must dedup to a single asset rather than emit two for one favorite.
        final DataEntityDimensionsDto first = dimensions(50L, (short) 1, false);
        final DataEntityDimensionsDto second = dimensions(50L, (short) 1, false);
        when(dataEntityRepository.getDimensionsByIds(Set.of(50L))).thenReturn(Mono.just(List.of(first, second)));
        when(dataEntityMapper.mapRef(first)).thenReturn(mock(DataEntityRef.class));
        when(dataEntityMapper.mapRef(second)).thenReturn(mock(DataEntityRef.class));

        StepVerifier.create(resolver.resolve(List.of(fav("DATA_ENTITY", 50L))))
            .assertNext(items -> assertThat(items).hasSize(1))
            .verifyComplete();
    }

    private static FavoritePojo fav(final String kind, final long id) {
        return new FavoritePojo().setAssetKind(kind).setAssetId(id);
    }

    private static DataEntityDimensionsDto dimensions(final long id, final short status, final boolean hollow) {
        final DataEntityDimensionsDto dto = mock(DataEntityDimensionsDto.class);
        when(dto.getDataEntity()).thenReturn(new DataEntityPojo().setId(id).setStatus(status).setHollow(hollow));
        return dto;
    }
}
