package org.opendatadiscovery.oddplatform.service;

import java.time.LocalDateTime;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.opendatadiscovery.oddplatform.api.contract.model.AssetFields;
import org.opendatadiscovery.oddplatform.api.contract.model.AssetKind;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityRef;
import org.opendatadiscovery.oddplatform.api.contract.model.QueryExampleRef;
import org.opendatadiscovery.oddplatform.api.contract.model.TermRef;
import org.opendatadiscovery.oddplatform.dto.AssetFieldDto;
import org.opendatadiscovery.oddplatform.dto.AssetRefDto;
import org.opendatadiscovery.oddplatform.dto.DataEntityClassDto;
import org.opendatadiscovery.oddplatform.dto.DataEntityDimensionsDto;
import org.opendatadiscovery.oddplatform.dto.attributes.DataConsumerAttributes;
import org.opendatadiscovery.oddplatform.dto.attributes.DataEntityAttributes;
import org.opendatadiscovery.oddplatform.dto.attributes.DataInputAttributes;
import org.opendatadiscovery.oddplatform.dto.attributes.DataTransformerAttributes;
import org.opendatadiscovery.oddplatform.dto.term.TermDto;
import org.opendatadiscovery.oddplatform.dto.term.TermRefDto;
import org.opendatadiscovery.oddplatform.mapper.AssetFieldsMapper;
import org.opendatadiscovery.oddplatform.mapper.DataEntityMapper;
import org.opendatadiscovery.oddplatform.mapper.QueryExampleMapper;
import org.opendatadiscovery.oddplatform.mapper.TermMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.NamespacePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.QueryExamplePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TagPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TermPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataEntityRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveLineageRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveQueryExampleRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveTagRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveTermRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyCollection;
import static org.mockito.ArgumentMatchers.anySet;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

/**
 * BEHAVIORAL unit test for the SHARED polymorphic resolver {@link AssetRefResolver} (issue #1815/#1816, ADR
 * D3/D4): resolves {@code (kind, id)} pairs into per-kind refs across the 3 kinds and inherits each kind's
 * visibility — a deleted/hollow asset is absent from the result map. The per-kind repos + ref mappers are
 * mocked. Ordering + per-row metadata are the adapters' concern (see FavoriteAssetResolverTest /
 * RecentlyViewedAssetResolverTest), so this test asserts the resolved-by-key map only.
 *
 * <p>CTRIB-073 (#1847 ST-13a) adds the result-column projection: the two-argument {@code resolveByKey(refs, fields)}
 * attaches {@code AssetFields} per row and fetches the per-page extras ONLY for the tokens named; the one-argument
 * overload must stay the exact no-fields path (no extras, {@code fields == null}) for Favorites / Recently-viewed.
 * The term and query-example reads are batched (one query per page) — the deleted-row filters are preserved.
 */
@ExtendWith(MockitoExtension.class)
class AssetRefResolverTest {

    @Mock private ReactiveDataEntityRepository dataEntityRepository;
    @Mock private DataEntityMapper dataEntityMapper;
    @Mock private ReactiveTermRepository termRepository;
    @Mock private TermMapper termMapper;
    @Mock private ReactiveQueryExampleRepository queryExampleRepository;
    @Mock private QueryExampleMapper queryExampleMapper;
    @Mock private ReactiveTagRepository tagRepository;
    @Mock private ReactiveLineageRepository lineageRepository;
    @Mock private AssetFieldsMapper assetFieldsMapper;

    private AssetRefResolver resolver;

    @BeforeEach
    void setUp() {
        resolver = new AssetRefResolver(dataEntityRepository, dataEntityMapper,
            termRepository, termMapper, queryExampleRepository, queryExampleMapper,
            tagRepository, lineageRepository, assetFieldsMapper);
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
                assertThat(r.fields()).as("the no-fields path attaches no projection").isNull();
            })
            .verifyComplete();
        // The pre-ST-13a path: nothing beyond the dimensions read — no extras, no projection mapper.
        verifyNoInteractions(tagRepository, lineageRepository, assetFieldsMapper);
        verify(dataEntityRepository, never()).getParentDEGs(anyCollection());
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
    void resolveByKey_term_mapsToRef_fromOneBatchedRead() {
        // ST-13a: the N per-id getTermRefDto reads became ONE getTermDtosByIds per page; the ref the row gets
        // is still termMapper.mapToRef(the same TermRefDto shape), so Favorites / Recently-viewed see no change.
        final TermRefDto dto = mock(TermRefDto.class);
        when(dto.getTerm()).thenReturn(new TermPojo().setId(20L));
        final TermDto termDto = TermDto.builder().termRefDto(dto).build();
        final TermRef ref = mock(TermRef.class);
        when(termRepository.getTermDtosByIds(Set.of(20L))).thenReturn(Mono.just(List.of(termDto)));
        when(termMapper.mapToRef(dto)).thenReturn(ref);

        StepVerifier.create(resolver.resolveByKey(List.of(new AssetRefDto("TERM", 20L))))
            .assertNext(map -> {
                final AssetRefResolver.ResolvedAsset r = map.get("TERM:20");
                assertThat(r.assetKind()).isEqualTo(AssetKind.TERM);
                assertThat(r.term()).isSameAs(ref);
                assertThat(r.fields()).isNull();
            })
            .verifyComplete();
        verify(termRepository, never()).getTermRefDto(any());
        verifyNoInteractions(tagRepository);
    }

    @Test
    void resolveByKey_term_missingFromBatchedRead_isAbsent() {
        // A soft-deleted term is filtered by the batched read's DELETED_AT IS NULL (the getTermRefDto predicate);
        // an id the read does not return simply has no entry — the semi-join drops it.
        when(termRepository.getTermDtosByIds(Set.of(21L))).thenReturn(Mono.just(List.of()));
        StepVerifier.create(resolver.resolveByKey(List.of(new AssetRefDto("TERM", 21L))))
            .assertNext(map -> assertThat(map).isEmpty())
            .verifyComplete();
    }

    @Test
    void resolveByKey_queryExample_dropsDeleted() {
        final QueryExamplePojo active = new QueryExamplePojo().setId(30L);
        final QueryExamplePojo deleted = new QueryExamplePojo().setId(31L).setDeletedAt(LocalDateTime.now());
        final QueryExampleRef ref = mock(QueryExampleRef.class);
        // ST-13a: ONE listByIds per page instead of N get(id) reads; a soft-deleted row is still dropped.
        when(queryExampleRepository.listByIds(Set.of(30L, 31L))).thenReturn(Mono.just(List.of(active, deleted)));
        when(queryExampleMapper.mapToQueryExampleRef(active)).thenReturn(ref);

        StepVerifier.create(resolver.resolveByKey(
                List.of(new AssetRefDto("QUERY_EXAMPLE", 30L), new AssetRefDto("QUERY_EXAMPLE", 31L))))
            .assertNext(map -> {
                assertThat(map).hasSize(1);
                assertThat(map.get("QUERY_EXAMPLE:30").queryExample()).isSameAs(ref);
                assertThat(map.get("QUERY_EXAMPLE:30").fields()).isNull();
            })
            .verifyComplete();
        verify(queryExampleRepository, never()).get(any(Long.class));
    }

    @Test
    void resolveByKey_dedupsDuplicateRowsDefensively() {
        // getDimensionsByIds normally returns one row per id; if it ever returned duplicates, the resolver
        // must keep a single entry rather than emit two for one reference.
        final DataEntityDimensionsDto first = dimensions(50L, (short) 1, false);
        final DataEntityDimensionsDto second = dimensions(50L, (short) 1, false);
        when(dataEntityRepository.getDimensionsByIds(Set.of(50L))).thenReturn(Mono.just(List.of(first, second)));
        // Only the kept row is mapped (ST-13a merges duplicates BEFORE mapping); which one wins is pinned below.
        lenient().when(dataEntityMapper.mapRef(first)).thenReturn(mock(DataEntityRef.class));
        lenient().when(dataEntityMapper.mapRef(second)).thenReturn(mock(DataEntityRef.class));

        StepVerifier.create(resolver.resolveByKey(List.of(new AssetRefDto("DATA_ENTITY", 50L))))
            .assertNext(map -> assertThat(map).hasSize(1))
            .verifyComplete();
    }

    @Test
    void resolveByKey_duplicateRows_keepsTheEntityOwnNamespaceRow() {
        // The dimensions query LEFT JOINs the namespace by the entity's own id OR its datasource's, so an entity
        // whose two namespaces differ arrives as two rows. The row carrying the entity's OWN namespace wins,
        // whichever order the driver emits them in (ST-13a — the Namespace column must be deterministic).
        final NamespacePojo own = new NamespacePojo().setId(7L).setName("own");
        final NamespacePojo fromDatasource = new NamespacePojo().setId(8L).setName("datasource");
        final DataEntityDimensionsDto viaDatasource = dimensions(60L, (short) 1, false);
        lenient().when(viaDatasource.getNamespace()).thenReturn(fromDatasource); // the losing row is never read
        final DataEntityDimensionsDto viaOwn = dimensions(60L, (short) 1, false);
        when(viaOwn.getNamespace()).thenReturn(own);
        viaOwn.getDataEntity().setNamespaceId(7L);
        viaDatasource.getDataEntity().setNamespaceId(7L);
        when(dataEntityRepository.getDimensionsByIds(Set.of(60L)))
            .thenReturn(Mono.just(List.of(viaDatasource, viaOwn)));
        final DataEntityRef ref = mock(DataEntityRef.class);
        when(dataEntityMapper.mapRef(viaOwn)).thenReturn(ref);

        StepVerifier.create(resolver.resolveByKey(List.of(new AssetRefDto("DATA_ENTITY", 60L))))
            .assertNext(map -> assertThat(map.get("DATA_ENTITY:60").dataEntity()).isSameAs(ref))
            .verifyComplete();
        verify(dataEntityMapper, never()).mapRef(viaDatasource);
    }

    // ---- ST-13a: the result-column projection --------------------------------------------------------------

    @Test
    void resolveByKey_withFields_projectsEveryKind_andFetchesNoExtraForZeroCostTokens() {
        final DataEntityDimensionsDto dto = dimensions(70L, (short) 1, false);
        when(dataEntityRepository.getDimensionsByIds(Set.of(70L))).thenReturn(Mono.just(List.of(dto)));
        when(dataEntityMapper.mapRef(dto)).thenReturn(mock(DataEntityRef.class));
        final TermRefDto termRefDto = mock(TermRefDto.class);
        when(termRefDto.getTerm()).thenReturn(new TermPojo().setId(71L));
        final TermDto termDto = TermDto.builder().termRefDto(termRefDto).build();
        when(termRepository.getTermDtosByIds(Set.of(71L))).thenReturn(Mono.just(List.of(termDto)));
        when(termMapper.mapToRef(termRefDto)).thenReturn(mock(TermRef.class));
        final QueryExamplePojo qe = new QueryExamplePojo().setId(72L);
        when(queryExampleRepository.listByIds(Set.of(72L))).thenReturn(Mono.just(List.of(qe)));
        when(queryExampleMapper.mapToQueryExampleRef(qe)).thenReturn(mock(QueryExampleRef.class));

        final Set<AssetFieldDto> fields = EnumSet.of(AssetFieldDto.NAMESPACE, AssetFieldDto.OWNERS,
            AssetFieldDto.UPDATED_AT, AssetFieldDto.DESCRIPTION);
        final AssetFields deFields = new AssetFields();
        final AssetFields termFields = new AssetFields();
        final AssetFields qeFields = new AssetFields();
        when(assetFieldsMapper.forDataEntity(eq(dto), eq(fields), any())).thenReturn(deFields);
        when(assetFieldsMapper.forTerm(eq(termDto), eq(fields), any())).thenReturn(termFields);
        when(assetFieldsMapper.forQueryExample(qe, fields)).thenReturn(qeFields);

        StepVerifier.create(resolver.resolveByKey(List.of(new AssetRefDto("DATA_ENTITY", 70L),
                new AssetRefDto("TERM", 71L), new AssetRefDto("QUERY_EXAMPLE", 72L)), fields))
            .assertNext(map -> {
                assertThat(map.get("DATA_ENTITY:70").fields()).isSameAs(deFields);
                assertThat(map.get("TERM:71").fields()).isSameAs(termFields);
                assertThat(map.get("QUERY_EXAMPLE:72").fields()).isSameAs(qeFields);
            })
            .verifyComplete();
        // Zero-cost tokens come from the reads already made: NO extra query fires.
        verifyNoInteractions(tagRepository, lineageRepository);
        verify(dataEntityRepository, never()).getParentDEGs(anyCollection());
        verify(dataEntityRepository, never()).listByOddrns(anyCollection(), any(Boolean.class), any(Boolean.class));
        verify(dataEntityRepository, never()).getDEGEntitiesCount(anyCollection());
        verify(dataEntityRepository, never()).getExperimentRunsCount(anyCollection());
    }

    @Test
    void resolveByKey_withFields_firesEachBatchedExtraOnceAndOnlyWhenItsTokenIsRequested() {
        final DataEntityDimensionsDto dto = dimensions(80L, (short) 1, false);
        final DataEntityPojo pojo = dto.getDataEntity();
        pojo.setOddrn("//src/job").setEntityClassIds(new Integer[] {
            DataEntityClassDto.DATA_TRANSFORMER.getId(), DataEntityClassDto.DATA_SET.getId(),
            DataEntityClassDto.DATA_ENTITY_GROUP.getId()});
        final DataTransformerAttributes dta = new DataTransformerAttributes();
        dta.setSourceOddrnList(Set.of("//src/a"));
        dta.setTargetOddrnList(Set.of("//src/b"));
        when(dto.getSpecificAttributes()).thenReturn(Map.<DataEntityClassDto, DataEntityAttributes>of(
            DataEntityClassDto.DATA_TRANSFORMER, dta));
        when(dataEntityRepository.getDimensionsByIds(Set.of(80L))).thenReturn(Mono.just(List.of(dto)));
        when(dataEntityMapper.mapRef(dto)).thenReturn(mock(DataEntityRef.class));
        when(dataEntityRepository.getParentDEGs(Set.of("//src/job"))).thenReturn(Mono.just(Map.of()));
        when(tagRepository.listTagsByDataEntityIds(Set.of(80L))).thenReturn(Mono.just(Map.of()));
        when(dataEntityRepository.listByOddrns(Set.of("//src/a", "//src/b"), false, false))
            .thenReturn(Flux.just(new DataEntityPojo().setOddrn("//src/a")));
        when(lineageRepository.getTargetsCount(Set.of("//src/job"))).thenReturn(Mono.just(Map.of("//src/job", 3L)));
        when(dataEntityRepository.getDEGEntitiesCount(Set.of("//src/job"))).thenReturn(Mono.just(Map.of()));
        when(dataEntityRepository.getExperimentRunsCount(Set.of("//src/job"))).thenReturn(Mono.just(Map.of()));
        when(assetFieldsMapper.forDataEntity(eq(dto), anySet(), any())).thenReturn(new AssetFields());

        final Set<AssetFieldDto> all = EnumSet.of(AssetFieldDto.GROUPS, AssetFieldDto.TAGS, AssetFieldDto.SOURCES,
            AssetFieldDto.TARGETS, AssetFieldDto.CONSUMERS_COUNT, AssetFieldDto.ENTITIES_COUNT);
        StepVerifier.create(resolver.resolveByKey(List.of(new AssetRefDto("DATA_ENTITY", 80L)), all))
            .assertNext(map -> assertThat(map).hasSize(1))
            .verifyComplete();
        // Each extra exactly ONCE for the page, the four lineage-list columns sharing ONE oddrn read.
        verify(dataEntityRepository).getParentDEGs(Set.of("//src/job"));
        verify(tagRepository).listTagsByDataEntityIds(Set.of(80L));
        verify(dataEntityRepository).listByOddrns(Set.of("//src/a", "//src/b"), false, false);
        verify(lineageRepository).getTargetsCount(Set.of("//src/job"));
        verify(dataEntityRepository).getDEGEntitiesCount(Set.of("//src/job"));
        verify(dataEntityRepository).getExperimentRunsCount(Set.of("//src/job"));
        // The mapper received the extras (the lineage ref resolved by oddrn, the consumers count).
        verify(assetFieldsMapper).forDataEntity(eq(dto), eq(all), org.mockito.ArgumentMatchers.argThat(extras ->
            extras.lineageByOddrn().containsKey("//src/a") && extras.consumersCount().get("//src/job") == 3L));
    }

    @Test
    void resolveByKey_withFields_termTagsOnlyWhenTagsRequested() {
        final TermRefDto termRefDto = mock(TermRefDto.class);
        when(termRefDto.getTerm()).thenReturn(new TermPojo().setId(90L));
        final TermDto termDto = TermDto.builder().termRefDto(termRefDto).build();
        when(termRepository.getTermDtosByIds(Set.of(90L))).thenReturn(Mono.just(List.of(termDto)));
        when(termMapper.mapToRef(termRefDto)).thenReturn(mock(TermRef.class));
        final List<TagPojo> tags = List.of(new TagPojo().setId(1L).setName("t"));
        when(tagRepository.listTagsByTermIds(Set.of(90L))).thenReturn(Mono.just(Map.of(90L, tags)));
        when(assetFieldsMapper.forTerm(termDto, EnumSet.of(AssetFieldDto.TAGS), tags)).thenReturn(new AssetFields());

        StepVerifier.create(resolver.resolveByKey(List.of(new AssetRefDto("TERM", 90L)),
                EnumSet.of(AssetFieldDto.TAGS)))
            .assertNext(map -> assertThat(map.get("TERM:90").fields()).isNotNull())
            .verifyComplete();
        verify(tagRepository).listTagsByTermIds(Set.of(90L));
    }

    @Test
    void resolveByKey_withFields_lineageOddrns_comeFromEveryClass_andSkipARowWithoutAttributes() {
        // a consumer (inputs), an input (outputs) and a row whose attributes never loaded share ONE oddrn read
        final DataEntityDimensionsDto consumer = dimensions(81L, (short) 1, false);
        consumer.getDataEntity().setOddrn("//c")
            .setEntityClassIds(new Integer[] {DataEntityClassDto.DATA_CONSUMER.getId()});
        final DataConsumerAttributes dca = new DataConsumerAttributes();
        dca.setInputListOddrn(Set.of("//in"));
        when(consumer.getSpecificAttributes()).thenReturn(Map.<DataEntityClassDto, DataEntityAttributes>of(
            DataEntityClassDto.DATA_CONSUMER, dca));
        final DataEntityDimensionsDto input = dimensions(82L, (short) 1, false);
        input.getDataEntity().setOddrn("//i").setEntityClassIds(new Integer[] {DataEntityClassDto.DATA_INPUT.getId()});
        final DataInputAttributes dia = new DataInputAttributes();
        dia.setOutputListOddrn(Set.of("//out"));
        when(input.getSpecificAttributes()).thenReturn(Map.<DataEntityClassDto, DataEntityAttributes>of(
            DataEntityClassDto.DATA_INPUT, dia));
        final DataEntityDimensionsDto bare = dimensions(83L, (short) 1, false);
        bare.getDataEntity().setOddrn("//b").setEntityClassIds(new Integer[] {DataEntityClassDto.DATA_SET.getId()});
        when(bare.getSpecificAttributes()).thenReturn(null);
        when(dataEntityRepository.getDimensionsByIds(Set.of(81L, 82L, 83L)))
            .thenReturn(Mono.just(List.of(consumer, input, bare)));
        for (final DataEntityDimensionsDto dto : List.of(consumer, input, bare)) {
            when(dataEntityMapper.mapRef(dto)).thenReturn(mock(DataEntityRef.class));
            when(assetFieldsMapper.forDataEntity(eq(dto), anySet(), any())).thenReturn(new AssetFields());
        }
        // the SAME oddrn twice from the read: one entry, never an exception (oddrn is unique in the table anyway)
        when(dataEntityRepository.listByOddrns(Set.of("//in", "//out"), false, false))
            .thenReturn(Flux.just(new DataEntityPojo().setOddrn("//in").setId(1L),
                new DataEntityPojo().setOddrn("//in").setId(1L)));

        final Set<AssetFieldDto> lists = EnumSet.of(AssetFieldDto.INPUTS, AssetFieldDto.OUTPUTS);
        StepVerifier.create(resolver.resolveByKey(List.of(new AssetRefDto("DATA_ENTITY", 81L),
                new AssetRefDto("DATA_ENTITY", 82L), new AssetRefDto("DATA_ENTITY", 83L)), lists))
            .assertNext(map -> assertThat(map).hasSize(3))
            .verifyComplete();
        verify(dataEntityRepository).listByOddrns(Set.of("//in", "//out"), false, false);
        verify(assetFieldsMapper).forDataEntity(eq(consumer), eq(lists), org.mockito.ArgumentMatchers.argThat(
            extras -> extras.lineageByOddrn().containsKey("//in") && !extras.lineageByOddrn().containsKey("//out")));
        // the count extras stay off: no dataset / group on the page and no count column requested
        verify(lineageRepository, never()).getTargetsCount(anySet());
        verify(dataEntityRepository, never()).getDEGEntitiesCount(anySet());
    }

    @Test
    void resolveByKey_withFields_duplicateTermAndQueryExampleRows_keepTheFirst() {
        // a batched read that returned the same id twice (a defensive merge, like the data-entity one)
        final TermRefDto termRefDto = mock(TermRefDto.class);
        when(termRefDto.getTerm()).thenReturn(new TermPojo().setId(91L));
        final TermDto termDto = TermDto.builder().termRefDto(termRefDto).build();
        when(termRepository.getTermDtosByIds(Set.of(91L))).thenReturn(Mono.just(List.of(termDto, termDto)));
        when(termMapper.mapToRef(termRefDto)).thenReturn(mock(TermRef.class));
        final QueryExamplePojo qe = new QueryExamplePojo().setId(92L);
        when(queryExampleRepository.listByIds(Set.of(92L))).thenReturn(Mono.just(List.of(qe, qe)));
        when(queryExampleMapper.mapToQueryExampleRef(qe)).thenReturn(mock(QueryExampleRef.class));

        StepVerifier.create(resolver.resolveByKey(List.of(new AssetRefDto("TERM", 91L),
                new AssetRefDto("QUERY_EXAMPLE", 92L))))
            .assertNext(map -> assertThat(map).containsOnlyKeys("TERM:91", "QUERY_EXAMPLE:92"))
            .verifyComplete();
    }

    @Test
    void resolveByKey_dataEntityWithoutAStatus_isNotVisible_andADuplicateWithoutAnOwnNamespaceKeepsTheFirst() {
        final DataEntityDimensionsDto noStatus = dimensions(70L, (short) 1, false);
        noStatus.getDataEntity().setStatus(null);
        // two rows, neither carrying the entity's own namespace: the first stays
        final DataEntityDimensionsDto first = dimensions(71L, (short) 1, false);
        final DataEntityDimensionsDto second = dimensions(71L, (short) 1, false);
        second.getDataEntity().setNamespaceId(5L);
        lenient().when(second.getNamespace()).thenReturn(new NamespacePojo().setId(6L));
        when(dataEntityRepository.getDimensionsByIds(Set.of(70L, 71L)))
            .thenReturn(Mono.just(List.of(noStatus, first, second)));
        final DataEntityRef ref = mock(DataEntityRef.class);
        when(dataEntityMapper.mapRef(first)).thenReturn(ref);

        StepVerifier.create(resolver.resolveByKey(List.of(new AssetRefDto("DATA_ENTITY", 70L),
                new AssetRefDto("DATA_ENTITY", 71L))))
            .assertNext(map -> {
                assertThat(map).containsOnlyKeys("DATA_ENTITY:71");
                assertThat(map.get("DATA_ENTITY:71").dataEntity()).isSameAs(ref);
            })
            .verifyComplete();
        verify(dataEntityMapper, never()).mapRef(second);
        verify(dataEntityMapper, never()).mapRef(noStatus);
    }

    private static DataEntityDimensionsDto dimensions(final long id, final short status, final boolean hollow) {
        final DataEntityDimensionsDto dto = mock(DataEntityDimensionsDto.class);
        when(dto.getDataEntity()).thenReturn(new DataEntityPojo().setId(id).setStatus(status).setHollow(hollow));
        return dto;
    }
}
