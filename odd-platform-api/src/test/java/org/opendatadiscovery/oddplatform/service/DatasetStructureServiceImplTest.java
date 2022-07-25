package org.opendatadiscovery.oddplatform.service;

import java.util.List;
import java.util.Map;
import java.util.Set;
import org.jeasy.random.EasyRandom;
import org.jeasy.random.EasyRandomParameters;
import org.jetbrains.annotations.NotNull;
import org.jooq.JSONB;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.opendatadiscovery.oddplatform.dto.DatasetStructureDelta;
import org.opendatadiscovery.oddplatform.dto.ingestion.DataEntityIngestionDto;
import org.opendatadiscovery.oddplatform.dto.ingestion.EnrichedDataEntityIngestionDto;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataSetField;
import org.opendatadiscovery.oddplatform.mapper.DatasetVersionMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetFieldPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetStructurePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetVersionPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDatasetFieldRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDatasetStructureRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDatasetVersionRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import static org.assertj.core.api.Assertions.assertThat;
import static org.jeasy.random.FieldPredicates.ofType;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("Unit tests for IngestionService")
class DatasetStructureServiceImplTest {

    private DatasetStructureService datasetStructureService;

    @Mock
    private ReactiveDatasetVersionRepository reactiveDatasetVersionRepository;
    @Mock
    private ReactiveDatasetStructureRepository reactiveDatasetStructureRepository;
    @Mock
    private DatasetFieldService datasetFieldService;
    @Mock
    private DatasetVersionMapper datasetVersionMapper;

    private static final EasyRandom EASY_RANDOM;

    static {
        final EasyRandomParameters easyRandomParameters = new EasyRandomParameters();
        easyRandomParameters.excludeField(ofType(JSONB.class));
        EASY_RANDOM = new EasyRandom(easyRandomParameters);
    }

    @BeforeEach
    void setUp() {
        datasetStructureService = new DatasetStructureServiceImpl(reactiveDatasetVersionRepository,
            reactiveDatasetStructureRepository, datasetFieldService, datasetVersionMapper);
    }

    @Test
    @DisplayName("Test create DatasetStructure, expecting successfully created")
    void testCreateDataStructure() {
        final DatasetVersionPojo expectedVersion = EASY_RANDOM.nextObject(DatasetVersionPojo.class);
        final DatasetFieldPojo expectedDatasetField = EASY_RANDOM.nextObject(DatasetFieldPojo.class);
        final Map<String, List<DatasetFieldPojo>> expectedDatasetFieldsMap = Map.of(
            expectedVersion.getDatasetOddrn(), List.of(expectedDatasetField));
        final DatasetStructurePojo datasetStructurePojos = EASY_RANDOM.nextObject(DatasetStructurePojo.class);

        when(datasetFieldService.createOrUpdateDatasetFields(any()))
            .thenReturn(Mono.just(List.of(expectedDatasetField)));
        when(reactiveDatasetVersionRepository.bulkCreate(any())).thenReturn(Flux.just(expectedVersion));
        when(reactiveDatasetStructureRepository.bulkCreate(any())).thenReturn(Flux.just(datasetStructurePojos));

        final Mono<List<DatasetStructurePojo>> actualCreatedDataStructure =
            datasetStructureService.createDatasetStructure(List.of(expectedVersion), expectedDatasetFieldsMap);

        actualCreatedDataStructure.as(StepVerifier::create)
            .assertNext(a -> assertThat(a).isNotNull())
            .verifyComplete();
    }

    @Test
    @DisplayName("Test get last DatasetStructure version delta, expecting successfully retrieved")
    void testGetLastDatasetStructureVersionDelta() {
        final DatasetVersionPojo expectedVersion = EASY_RANDOM.nextObject(DatasetVersionPojo.class);
        final DatasetVersionPojo expectedPenultimateVersion = EASY_RANDOM.nextObject(DatasetVersionPojo.class);
        expectedVersion.setVersion(3L);
        expectedPenultimateVersion.setVersion(2L);
        final DatasetFieldPojo expectedDatasetField = EASY_RANDOM.nextObject(DatasetFieldPojo.class);
        final Map<Long, List<DatasetFieldPojo>> expectedDatasetFieldsMap = Map.of(
            expectedVersion.getVersion(), List.of(expectedDatasetField));

        when(reactiveDatasetVersionRepository.getLatestVersions(any()))
            .thenReturn(Mono.just(List.of(expectedVersion, expectedPenultimateVersion)));
        when(reactiveDatasetVersionRepository.getPenultimateVersions(any()))
            .thenReturn(Mono.just(List.of(expectedVersion, expectedPenultimateVersion)));
        when(reactiveDatasetVersionRepository.getDatasetVersionFields(any()))
            .thenReturn(Mono.just(expectedDatasetFieldsMap));

        final Mono<Map<String, DatasetStructureDelta>> actualDelta =
            datasetStructureService.getLastDatasetStructureVersionDelta(List.of(1L, 2L));

        actualDelta.as(StepVerifier::create)
            .assertNext(a -> assertThat(a).isNotNull().hasSize(2))
            .verifyComplete();
    }

    @Test
    @DisplayName("Test get new DatasetVersions, expecting empty changes")
    void testGetNewDatasetVersionsIfChangedFalse() {
        final DatasetVersionPojo expectedVersion = EASY_RANDOM.nextObject(DatasetVersionPojo.class);
        final EnrichedDataEntityIngestionDto enrichedDataEntityIngestionDto =
            getEnrichedDataEntityIngestionDto(expectedVersion);
        final String structureHash = enrichedDataEntityIngestionDto.getDataSet().structureHash();
        expectedVersion.setVersionHash(structureHash);

        when(reactiveDatasetVersionRepository.getLatestVersions(any()))
            .thenReturn(Mono.just(List.of(expectedVersion)));

        final Mono<List<DatasetVersionPojo>> newDatasetVersionsIfChanged =
            datasetStructureService.getNewDatasetVersionsIfChanged(
                Map.of(enrichedDataEntityIngestionDto.getOddrn(), enrichedDataEntityIngestionDto),
                Set.of(enrichedDataEntityIngestionDto.getId()));

        newDatasetVersionsIfChanged.as(StepVerifier::create)
            .assertNext(a -> assertThat(a).isEmpty())
            .verifyComplete();
    }

    @Test
    @DisplayName("Test get new DatasetVersions, expecting Dataset schema changed")
    void testGetNewDatasetVersionsIfChanged() {
        final DatasetVersionPojo expectedVersion = EASY_RANDOM.nextObject(DatasetVersionPojo.class);
        final EnrichedDataEntityIngestionDto enrichedDataEntityIngestionDto =
            getEnrichedDataEntityIngestionDto(expectedVersion);
        expectedVersion.setVersionHash("New");

        when(reactiveDatasetVersionRepository.getLatestVersions(any()))
            .thenReturn(Mono.just(List.of(expectedVersion)));
        when(datasetVersionMapper.mapDatasetVersion(any(), any(), anyLong()))
            .thenReturn(expectedVersion);

        final Mono<List<DatasetVersionPojo>> newDatasetVersionsIfChanged =
            datasetStructureService.getNewDatasetVersionsIfChanged(
                Map.of(enrichedDataEntityIngestionDto.getOddrn(), enrichedDataEntityIngestionDto),
                Set.of(enrichedDataEntityIngestionDto.getId()));

        newDatasetVersionsIfChanged.as(StepVerifier::create)
            .assertNext(a -> {
                assertThat(a)
                    .isNotEmpty()
                    .hasSize(1);
            })
            .verifyComplete();
    }

    @NotNull
    private EnrichedDataEntityIngestionDto getEnrichedDataEntityIngestionDto(
        final DatasetVersionPojo expectedVersion) {
        final DataEntityIngestionDto dataEntityIngestionDto = new DataEntityIngestionDto();
        final EnrichedDataEntityIngestionDto enrichedDataEntityIngestionDto = new EnrichedDataEntityIngestionDto(
            1L, dataEntityIngestionDto);
        enrichedDataEntityIngestionDto.setOddrn(expectedVersion.getDatasetOddrn());
        enrichedDataEntityIngestionDto.setDataSet(createDataSetIngestionDto(expectedVersion));
        return enrichedDataEntityIngestionDto;
    }

    @NotNull
    private DataEntityIngestionDto.DataSetIngestionDto createDataSetIngestionDto(
        final DatasetVersionPojo expectedVersion) {
        final DataSetField dataSetField = new DataSetField();
        return new DataEntityIngestionDto.DataSetIngestionDto(
            "", List.of(dataSetField), expectedVersion.getVersionHash(), 1L);
    }
}