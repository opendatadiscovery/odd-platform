package org.opendatadiscovery.oddplatform.service;

import com.fasterxml.jackson.core.type.TypeReference;
import java.nio.file.Paths;
import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Random;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import org.assertj.core.api.SoftAssertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.opendatadiscovery.oddplatform.dto.DataEntityDto;
import org.opendatadiscovery.oddplatform.dto.DataSourceDto;
import org.opendatadiscovery.oddplatform.dto.TokenDto;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataEntity;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataEntityGroup;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataEntityList;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataEntityType;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataSetField;
import org.opendatadiscovery.oddplatform.mapper.DataEntityTaskRunMapper;
import org.opendatadiscovery.oddplatform.mapper.DataEntityTaskRunMapperImpl;
import org.opendatadiscovery.oddplatform.mapper.DatasetFieldMapper;
import org.opendatadiscovery.oddplatform.mapper.DatasetFieldMapperImpl;
import org.opendatadiscovery.oddplatform.mapper.ingestion.IngestionMapper;
import org.opendatadiscovery.oddplatform.mapper.ingestion.IngestionMapperImpl;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataSourcePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetFieldPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetVersionPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.GroupEntityRelationsPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.LineagePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MetadataFieldValuePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TokenPojo;
import org.opendatadiscovery.oddplatform.repository.AlertRepository;
import org.opendatadiscovery.oddplatform.repository.DataEntityRepositoryImpl;
import org.opendatadiscovery.oddplatform.repository.DataEntityTaskRunRepository;
import org.opendatadiscovery.oddplatform.repository.DataQualityTestRelationRepository;
import org.opendatadiscovery.oddplatform.repository.DatasetStructureRepository;
import org.opendatadiscovery.oddplatform.repository.DatasetVersionRepository;
import org.opendatadiscovery.oddplatform.repository.GroupEntityRelationRepository;
import org.opendatadiscovery.oddplatform.repository.GroupParentGroupRelationRepository;
import org.opendatadiscovery.oddplatform.repository.LineageRepository;
import org.opendatadiscovery.oddplatform.repository.MetadataFieldRepository;
import org.opendatadiscovery.oddplatform.repository.MetadataFieldValueRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataSourceRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDatasetVersionRepository;
import org.opendatadiscovery.oddplatform.service.ingestion.TagIngestionService;
import org.opendatadiscovery.oddplatform.service.metadata.MetadataIngestionService;
import org.opendatadiscovery.oddplatform.service.metric.MetricService;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.when;
import static org.opendatadiscovery.oddplatform.utils.JSONTestUtils.deserializeJson;

@ExtendWith(MockitoExtension.class)
@DisplayName("Unit tests for IngestionService")
public class IngestionServiceImplTest {

    private static final String PATH_TO_DATA_ENTITY_LIST_FIXTURE = "src/test/resources/fixtures/ingestion/dag/dag.json";

    private static final String PATH_TO_LINEAGE_FIXTURE = "src/test/resources/fixtures/ingestion/dag/lineage.json";

    @Mock
    private AlertLocator alertLocator;

    @Mock
    private ReactiveDataSourceRepository dataSourceRepository;

    @Mock
    private DataEntityRepositoryImpl dataEntityRepository;

    @Mock
    private DatasetVersionRepository datasetVersionRepository;

    @Mock
    private ReactiveDatasetVersionRepository reactiveDatasetVersionRepository;

    @Mock
    private DatasetStructureRepository datasetStructureRepository;

    @Mock
    private MetadataFieldRepository metadataFieldRepository;

    @Mock
    private MetadataFieldValueRepository metadataFieldValueRepository;

    @Mock
    private LineageRepository lineageRepository;

    @Mock
    private DataQualityTestRelationRepository dataQualityTestRelationRepository;

    @Mock
    private DataEntityTaskRunRepository dataEntityTaskRunRepository;

    @Mock
    private AlertRepository alertRepository;

    @Mock
    private GroupEntityRelationRepository groupEntityRelationRepository;

    @Mock
    private GroupParentGroupRelationRepository groupParentGroupRelationRepository;

    @Spy
    private IngestionMapper ingestionMapper = new IngestionMapperImpl();

    @Spy
    private DatasetFieldMapper datasetFieldMapper = new DatasetFieldMapperImpl();

    @Spy
    private DataEntityTaskRunMapper dataEntityTaskRunMapper = new DataEntityTaskRunMapperImpl();

    @Mock
    private MetricService metricService;

    @Mock
    private MetadataIngestionService metadataIngestionService;

    @Mock
    private TagIngestionService tagIngestionService;

    @InjectMocks
    private IngestionServiceImpl ingestionService;

    private DataSourceDto dataSourceDto;

    private DataEntityList dataEntityList;

    @Captor
    private ArgumentCaptor<List<DataEntityPojo>> dataEntityListCaptor;

    @Captor
    private ArgumentCaptor<List<MetadataFieldValuePojo>> metadataFieldValueCaptor;

    @Captor
    private ArgumentCaptor<List<LineagePojo>> lineageCaptor;

    @Captor
    private ArgumentCaptor<Collection<String>> hollowOddrnCaptor;

    @Captor
    private ArgumentCaptor<List<DatasetVersionPojo>> datasetVersionCaptor;

    @Captor
    private ArgumentCaptor<Map<String, List<DatasetFieldPojo>>> datasetFieldsMapCaptor;

    @Captor
    private ArgumentCaptor<List<GroupEntityRelationsPojo>> groupEntityRelationsCaptor;

    @BeforeEach
    void setup() {
        dataSourceDto = new DataSourceDto(new DataSourcePojo().setId(1L), null,
            new TokenDto(new TokenPojo().setValue(UUID.randomUUID().toString())));
        dataEntityList = deserializeFixture(PATH_TO_DATA_ENTITY_LIST_FIXTURE,
            new TypeReference<>() {
            });
        when(dataSourceRepository.getDtoByOddrn(anyString())).thenReturn(Mono.just(dataSourceDto));
        when(metadataIngestionService.ingestMetadata(any())).thenReturn(Mono.empty());
        when(tagIngestionService.ingestExternalTags(any())).thenReturn(Mono.empty());
        when(reactiveDatasetVersionRepository.getLatestVersions(any())).thenReturn(Mono.empty());
    }

    @Nested
    @DisplayName("When ingesting new data entities")
    class NewEntities {

        @BeforeEach
        void setup() {
            final List<DataEntityPojo> anyDataEntityList = anyList();
            when(dataEntityRepository.bulkCreate(anyDataEntityList))
                .thenAnswer(invocation -> {
                    final List<DataEntityPojo> receivedDataEntities = invocation.getArgument(0);
                    return receivedDataEntities.stream()
                        .map(i -> i.setId(new Random().nextLong()))
                        .collect(Collectors.toList());
                });
            StepVerifier.create(ingestionService.ingest(dataEntityList)).verifyComplete();
        }

        @Test
        @DisplayName("Ingests data entities")
        void ingestDataEntities() {
            Mockito.verify(dataEntityRepository).bulkCreate(dataEntityListCaptor.capture());

            SoftAssertions.assertSoftly((softly) -> {
                softly.assertThat(dataEntityListCaptor.getValue()).hasSize(dataEntityList.getItems().size());
                softly.assertThat(dataEntityListCaptor.getValue()).hasOnlyElementsOfType(DataEntityPojo.class);
                softly.assertThat(dataEntityListCaptor.getValue()).extractingResultOf("getOddrn")
                    .containsAll(dataEntityList.getItems().stream()
                        .map(DataEntity::getOddrn)
                        .collect(Collectors.toList()));
            });
        }

        @Test
        @DisplayName("Ingests dependencies")
        void ingestDependencies() {
            final List<DataEntityGroup> actualGroupEntityRelations =
                dataEntityList.getItems().stream()
                    .map(DataEntity::getDataEntityGroup)
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList());

            Mockito.verify(groupEntityRelationRepository).createOrUpdateRelations(groupEntityRelationsCaptor.capture());

            assertThat(
                groupEntityRelationsCaptor.getValue().stream()
                    .map(GroupEntityRelationsPojo::getDataEntityOddrn)
                    .collect(Collectors.toList()))
                .hasSameElementsAs(actualGroupEntityRelations.stream()
                    .flatMap(i -> i.getEntitiesList().stream())
                    .collect(Collectors.toList()));
        }

        @Test
        @DisplayName("Ingests companions")
        void ingestCompanions() {
            final List<String> actualDatasetOddrns = dataEntityList.getItems().stream()
                .filter(i -> i.getDataset() != null)
                .map(DataEntity::getOddrn)
                .collect(Collectors.toList());

            final List<DataSetField> dataSetFields = dataEntityList.getItems().stream()
                .map(DataEntity::getDataset).filter(Objects::nonNull)
                .flatMap(i -> i.getFieldList().stream())
                .collect(Collectors.toList());

            Mockito.verify(datasetStructureRepository, atLeastOnce())
                .bulkCreate(datasetVersionCaptor.capture(), datasetFieldsMapCaptor.capture());

            assertThat(datasetVersionCaptor.getAllValues().get(0).stream()
                .map(DatasetVersionPojo::getDatasetOddrn)
                .collect(Collectors.toList())).hasSameElementsAs(actualDatasetOddrns);

            assertThat(datasetFieldsMapCaptor.getAllValues().get(0).keySet())
                .hasSameElementsAs(new HashSet<>(actualDatasetOddrns));

            assertThat(datasetFieldsMapCaptor.getAllValues().get(0).values().stream()
                .flatMap(i -> i.stream()
                    .map(DatasetFieldPojo::getOddrn))
                .collect(
                    Collectors.toList()))
                .hasSameElementsAs(dataSetFields.stream()
                    .map(DataSetField::getOddrn)
                    .collect(Collectors.toList()));

            assertThat(datasetFieldsMapCaptor.getAllValues().get(0).values().stream()
                .flatMap(i -> i.stream().map(DatasetFieldPojo::getName))
                .collect(Collectors.toList()))
                .hasSameElementsAs(dataSetFields.stream()
                    .map(DataSetField::getName)
                    .collect(Collectors.toList()));
        }
    }

    @Nested
    @DisplayName("When ingesting existing data entities")
    class ExistingEntities {
        @BeforeEach
        void setup() {
            when(dataEntityRepository.listDtosByOddrns(any(), eq(true))).thenReturn(
                dataEntityList.getItems().stream()
                    .map(de -> DataEntityDto
                        .builder()
                        .dataEntity(
                            new DataEntityPojo()
                                .setOddrn(de.getOddrn())
                                .setId(new Random().nextLong())
                                .setHollow(false))
                        .build())
                    .collect(Collectors.toList()));
            StepVerifier.create(ingestionService.ingest(dataEntityList)).expectComplete().verify();
        }

        @Test
        @DisplayName("Ingests data entities")
        void ingestDataEntities() {
            Mockito.verify(dataEntityRepository).bulkUpdate(dataEntityListCaptor.capture());
            SoftAssertions.assertSoftly((softly) -> {
                softly.assertThat(dataEntityListCaptor.getValue()).hasSize(dataEntityList.getItems().size());
                softly.assertThat(dataEntityListCaptor.getValue()).hasOnlyElementsOfType(DataEntityPojo.class);
                softly.assertThat(dataEntityListCaptor.getValue()).extractingResultOf("getOddrn")
                    .containsAll(dataEntityList.getItems().stream()
                        .map(DataEntity::getOddrn)
                        .collect(Collectors.toList()));
            });
        }

        @Test
        @DisplayName("Ingests dependencies")
        void ingestDependencies() {
            final List<LineagePojo> actualLineage = deserializeFixture(PATH_TO_LINEAGE_FIXTURE,
                new TypeReference<>() {
                });

            Mockito.verify(lineageRepository).replaceLineagePaths(lineageCaptor.capture());
            assertThat(lineageCaptor.getValue()).isEqualTo(actualLineage);

            final Set<String> actualHollowOddrns = Stream.concat(
                    Stream.of(dataEntityList.getDataSourceOddrn()),
                    dataEntityList.getItems().stream()
                        .filter(i -> i.getType() != DataEntityType.DAG)
                        .map(DataEntity::getOddrn))
                .collect(Collectors.toSet());
            Mockito.verify(dataEntityRepository).createHollow(hollowOddrnCaptor.capture());
            assertThat(hollowOddrnCaptor.getValue()).hasSameElementsAs(actualHollowOddrns);
        }
    }

    private <T> T deserializeFixture(final String path, final TypeReference<T> tr) {
        try {
            return deserializeJson(Paths.get(path).toFile(), tr);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}