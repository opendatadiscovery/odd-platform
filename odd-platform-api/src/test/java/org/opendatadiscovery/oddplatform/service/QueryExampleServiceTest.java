package org.opendatadiscovery.oddplatform.service;

import java.util.List;
import java.util.stream.Stream;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityList;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityQueryExampleFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityRef;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityStatus;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityStatusEnum;
import org.opendatadiscovery.oddplatform.api.contract.model.QueryExample;
import org.opendatadiscovery.oddplatform.api.contract.model.QueryExampleDetails;
import org.opendatadiscovery.oddplatform.api.contract.model.QueryExampleFormData;
import org.opendatadiscovery.oddplatform.dto.DataEntityDimensionsDto;
import org.opendatadiscovery.oddplatform.dto.QueryExampleDto;
import org.opendatadiscovery.oddplatform.exception.BadUserRequestException;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.mapper.DataEntityMapperImpl;
import org.opendatadiscovery.oddplatform.mapper.DataEntityRunMapperImpl;
import org.opendatadiscovery.oddplatform.mapper.DataEntityStatusMapper;
import org.opendatadiscovery.oddplatform.mapper.DataSourceMapperImpl;
import org.opendatadiscovery.oddplatform.mapper.DataSourceSafeMapperImpl;
import org.opendatadiscovery.oddplatform.mapper.DatasetFieldApiMapperImpl;
import org.opendatadiscovery.oddplatform.mapper.DatasetVersionMapperImpl;
import org.opendatadiscovery.oddplatform.mapper.DateTimeMapperImpl;
import org.opendatadiscovery.oddplatform.mapper.MetadataFieldMapperImpl;
import org.opendatadiscovery.oddplatform.mapper.MetadataFieldValueMapperImpl;
import org.opendatadiscovery.oddplatform.mapper.NamespaceMapperImpl;
import org.opendatadiscovery.oddplatform.mapper.OwnerMapperImpl;
import org.opendatadiscovery.oddplatform.mapper.OwnershipMapperImpl;
import org.opendatadiscovery.oddplatform.mapper.QueryExampleMapper;
import org.opendatadiscovery.oddplatform.mapper.QueryExampleMapperImpl;
import org.opendatadiscovery.oddplatform.mapper.TagMapperImpl;
import org.opendatadiscovery.oddplatform.mapper.TermMapperImpl;
import org.opendatadiscovery.oddplatform.mapper.TitleMapperImpl;
import org.opendatadiscovery.oddplatform.mapper.TokenMapperImpl;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityToQueryExamplePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.QueryExamplePojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataEntityQueryExampleRelationRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveQueryExampleRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveQueryExampleSearchEntrypointRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveTermQueryExampleRelationRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class QueryExampleServiceTest {
    private QueryExampleService queryExampleService;
    @Mock
    private ReactiveQueryExampleRepository queryExampleRepository;
    @Mock
    private ReactiveQueryExampleSearchEntrypointRepository queryExampleSearchEntrypointRepository;
    @Mock
    private ReactiveDataEntityQueryExampleRelationRepository dataEntityToQueryExampleRepository;
    @Mock
    private ReactiveTermQueryExampleRelationRepository termQueryExampleRelationRepository;
    @Mock
    private DataEntityService dataEntityService;
    private final QueryExampleMapper queryExampleMapper = new QueryExampleMapperImpl();

    @BeforeEach
    void setUp() {
        final TermMapperImpl termMapper = new TermMapperImpl(
            new NamespaceMapperImpl(),
            new DateTimeMapperImpl(),
            new OwnershipMapperImpl(
                new OwnerMapperImpl(),
                new TitleMapperImpl()
            )
        );

        queryExampleMapper.setDateTimeMapper(new DateTimeMapperImpl());
        queryExampleMapper.setTermMapper(termMapper);
        queryExampleMapper.setDataEntityMapper(
            new DataEntityMapperImpl(
                new DataSourceMapperImpl(
                    new NamespaceMapperImpl(),
                    new TokenMapperImpl(
                        new DateTimeMapperImpl()
                    )
                ),
                new DataSourceSafeMapperImpl(
                    new NamespaceMapperImpl()
                ),
                new OwnershipMapperImpl(
                    new OwnerMapperImpl(),
                    new TitleMapperImpl()
                ),
                new TagMapperImpl(),
                new MetadataFieldValueMapperImpl(
                    new MetadataFieldMapperImpl()
                ),
                new DatasetVersionMapperImpl(
                    new DatasetFieldApiMapperImpl(
                        new TagMapperImpl(),
                        new MetadataFieldValueMapperImpl(new MetadataFieldMapperImpl()),
                        termMapper
                    ),
                    new DateTimeMapperImpl()
                ),
                new DataEntityRunMapperImpl(
                    new DateTimeMapperImpl()
                ),
                termMapper,
                new DateTimeMapperImpl(),
                new DataEntityStatusMapper(),
                new DataEntityStaleDetector()
            ));
        queryExampleService = new QueryExampleServiceImpl(queryExampleRepository,
            queryExampleSearchEntrypointRepository,
            dataEntityToQueryExampleRepository,
            termQueryExampleRelationRepository,
            dataEntityService,
            queryExampleMapper);
    }

    @ParameterizedTest
    @MethodSource("queryExampleProvider")
    @DisplayName("Creates new queryExample")
    public void createQueryExampleTest(final QueryExampleFormData formData,
                                       final QueryExampleDetails expected,
                                       final QueryExamplePojo pojo) {
        when(queryExampleRepository.create(any(QueryExamplePojo.class))).thenReturn(Mono.just(pojo));
        when(queryExampleSearchEntrypointRepository
            .updateQueryExampleVectors(anyLong())).thenReturn(Mono.just(1));

        queryExampleService
            .createQueryExample(formData)
            .as(StepVerifier::create)
            .assertNext(item -> {
                assertEquals(expected.getDefinition(), item.getDefinition());
                assertEquals(expected.getQuery(), item.getQuery());
                assertEquals(0, expected.getLinkedEntities().getItems().size());
            }).verifyComplete();
    }

    @ParameterizedTest
    @MethodSource("queryExampleRelationProvider")
    @DisplayName("Creates new queryExample Relations")
    public void createQueryExampleRelationsTest(final Long datasetId,
                                                final DataEntityQueryExampleFormData formData,
                                                final DataEntityToQueryExamplePojo entityToQueryExamplePojo,
                                                final QueryExampleDto queryExampleDto,
                                                final QueryExample expected) {
        when(dataEntityToQueryExampleRepository.createRelationWithDataEntity(anyLong(), anyLong()))
            .thenReturn(Mono.just(entityToQueryExamplePojo));
        when(dataEntityToQueryExampleRepository.getQueryExampleDatasetRelations(anyLong()))
            .thenReturn(Mono.just(queryExampleDto));
        when(queryExampleSearchEntrypointRepository
            .updateQueryExampleVectorsForDataEntity(anyLong())).thenReturn(Mono.just(1));

        queryExampleService
            .createQueryExampleToDatasetRelationship(datasetId, formData.getQueryExampleId())
            .as(StepVerifier::create)
            .assertNext(item -> {
                assertEquals(expected.getDefinition(), item.getDefinition());
                assertEquals(expected.getQuery(), item.getQuery());
                assertEquals(1, expected.getLinkedEntities().size());
            }).verifyComplete();
    }

    @ParameterizedTest
    @MethodSource("queryExampleDetailsProvider")
    @DisplayName("get QueryExampleDetails by Id")
    public void getQueryExampleDetailsTest(final Long queryExampleId,
                                           final QueryExamplePojo pojo,
                                           final QueryExampleDto queryExampleDto,
                                           final DataEntityDimensionsDto dataEntityDimensionsDto,
                                           final QueryExample expected) {
        when(dataEntityToQueryExampleRepository.getQueryExampleDatasetRelations(anyLong()))
            .thenReturn(Mono.just(queryExampleDto));
        when(queryExampleRepository.get(anyLong()))
            .thenReturn(Mono.just(pojo));
        when(dataEntityService
            .getDimensionsByIds(any()))
            .thenReturn(Mono.just(List.of(dataEntityDimensionsDto)));

        queryExampleService
            .getQueryExampleDetails(queryExampleId)
            .as(StepVerifier::create)
            .assertNext(item -> {
                assertEquals(expected.getDefinition(), item.getDefinition());
                assertEquals(expected.getQuery(), item.getQuery());
                assertEquals(1, expected.getLinkedEntities().size());
                assertEquals(1, expected.getLinkedEntities().get(0).getId());
            }).verifyComplete();
    }

    @ParameterizedTest
    @MethodSource("deleteQueryExampleProvider")
    @DisplayName("deleteQueryExample by Id")
    public void deleteQueryExampleTest(final Long queryExampleId,
                                       final QueryExamplePojo pojo) {
        when(queryExampleRepository.get(anyLong()))
            .thenReturn(Mono.just(pojo));
        when(queryExampleRepository.delete(anyLong())).thenReturn(Mono.empty());
        when(dataEntityToQueryExampleRepository.removeRelationWithDataEntityByQueryId(anyLong()))
            .thenReturn(Flux.empty());
        when(termQueryExampleRelationRepository.removeRelationWithTermByQueryId(anyLong()))
            .thenReturn(Flux.empty());

        queryExampleService
            .deleteQueryExample(queryExampleId)
            .as(StepVerifier::create)
            .verifyComplete();

        verify(queryExampleRepository, times(1)).delete(anyLong());
        verify(dataEntityToQueryExampleRepository, times(1))
            .removeRelationWithDataEntityByQueryId(anyLong());
    }

    @Test
    @DisplayName("trying to get not existing QueryExampleDetails by Id")
    public void getNotExistingQueryExampleDetails() {
        when(queryExampleRepository.get(anyLong()))
            .thenReturn(Mono.empty());
        when(dataEntityToQueryExampleRepository.getQueryExampleDatasetRelations(anyLong()))
            .thenReturn(Mono.empty());

        queryExampleService
            .getQueryExampleDetails(1L)
            .as(StepVerifier::create)
            .verifyError(NotFoundException.class);
    }

    @Test
    @DisplayName("trying to create duplicate relation")
    public void createDuplicateRelations() {
        when(dataEntityToQueryExampleRepository.createRelationWithDataEntity(anyLong(), anyLong()))
            .thenReturn(Mono.empty());
        when(dataEntityToQueryExampleRepository.getQueryExampleDatasetRelations(anyLong()))
            .thenReturn(Mono.empty());
        when(queryExampleSearchEntrypointRepository
            .updateQueryExampleVectorsForDataEntity(anyLong()))
            .thenReturn(Mono.empty());

        queryExampleService
            .createQueryExampleToDatasetRelationship(1L, 1L)
            .as(StepVerifier::create)
            .verifyError(BadUserRequestException.class);
    }

    @Test
    @DisplayName("trying to delete not existing QueryExampleDetails by Id")
    public void deleteNotExistingQueryExample() {
        when(queryExampleRepository.get(anyLong()))
            .thenReturn(Mono.empty());
        when(queryExampleRepository.delete(anyLong())).thenReturn(Mono.empty());
        when(dataEntityToQueryExampleRepository.removeRelationWithDataEntityByQueryId(anyLong()))
            .thenReturn(Flux.empty());

        queryExampleService
            .deleteQueryExample(1L)
            .as(StepVerifier::create)
            .verifyError(NotFoundException.class);
    }

    private static Stream<Arguments> queryExampleProvider() {
        return Stream.of(
            Arguments.arguments(new QueryExampleFormData("def", "select 1 from dual"),
                new QueryExampleDetails()
                    .query("select 1 from dual")
                    .definition("def")
                    .linkedEntities(new DataEntityList().items(List.of())),
                new QueryExamplePojo()
                    .setId(1L)
                    .setQuery("select 1 from dual")
                    .setDefinition("def")
            ),
            Arguments.arguments(new QueryExampleFormData("def2", "select 2 from second"),
                new QueryExampleDetails()
                    .query("select 2 from second")
                    .definition("def2")
                    .linkedEntities(new DataEntityList().items(List.of())),
                new QueryExamplePojo()
                    .setId(2L)
                    .setQuery("select 2 from second")
                    .setDefinition("def2"))
        );
    }

    private static Stream<Arguments> queryExampleRelationProvider() {
        return Stream.of(
            Arguments.arguments(1L,
                new DataEntityQueryExampleFormData().queryExampleId(1L),
                new DataEntityToQueryExamplePojo()
                    .setDataEntityId(1L)
                    .setQueryExampleId(1L),
                new QueryExampleDto(
                    new QueryExamplePojo()
                        .setId(1L)
                        .setQuery("select 1 from dual")
                        .setDefinition("def"),
                    List.of(new DataEntityPojo().setId(1L).setStatus((short) 3)),
                    List.of()
                ),
                new QueryExample()
                    .query("select 1 from dual")
                    .definition("def")
                    .linkedEntities(List.of(new DataEntityRef()
                        .id(1L)
                        .status(new DataEntityStatus(DataEntityStatusEnum.STABLE))))
            ));
    }

    private static Stream<Arguments> queryExampleDetailsProvider() {
        final QueryExamplePojo pojo = new QueryExamplePojo()
            .setId(1L)
            .setQuery("select 1 from dual")
            .setDefinition("def");

        return Stream.of(
            Arguments.arguments(1L,
                pojo,
                new QueryExampleDto(
                    pojo,
                    List.of(new DataEntityPojo().setId(1L).setStatus((short) 3)),
                    List.of()
                ),
                DataEntityDimensionsDto
                    .dimensionsBuilder()
                    .dataEntity(new DataEntityPojo()
                        .setId(1L)
                        .setTypeId(1)
                        .setStatus((short) 3)).build(),
                new QueryExample()
                    .query("select 1 from dual")
                    .definition("def")
                    .linkedEntities(List.of(new DataEntityRef()
                        .id(1L)
                        .status(new DataEntityStatus(DataEntityStatusEnum.STABLE))))
            ));
    }

    private static Stream<Arguments> deleteQueryExampleProvider() {
        return Stream.of(
            Arguments.arguments(1L,
                new QueryExamplePojo()
                    .setId(1L)
                    .setQuery("select 1 from dual")
                    .setDefinition("def")
            ));
    }
}
