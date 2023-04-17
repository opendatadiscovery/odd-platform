package org.opendatadiscovery.oddplatform.repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import org.assertj.core.api.recursive.comparison.RecursiveComparisonConfiguration;
import org.jeasy.random.EasyRandom;
import org.jeasy.random.EasyRandomParameters;
import org.jooq.JSONB;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.BaseIntegrationTest;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSetFieldStat;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSetFieldType;
import org.opendatadiscovery.oddplatform.dto.DatasetFieldDto;
import org.opendatadiscovery.oddplatform.dto.LabelDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetFieldPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetVersionPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.LabelPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataEntityRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDatasetVersionRepository;
import org.opendatadiscovery.oddplatform.service.DatasetStructureService;
import org.opendatadiscovery.oddplatform.utils.JSONTestUtils;
import org.springframework.beans.factory.annotation.Autowired;
import reactor.test.StepVerifier;

import static org.assertj.core.api.Assertions.assertThat;
import static org.jeasy.random.FieldPredicates.ofType;
import static org.jooq.JSONB.jsonb;

class ReactiveDatasetVersionRepositoryImplTest extends BaseIntegrationTest {

    @Autowired
    ReactiveDatasetVersionRepository reactiveDatasetVersionRepository;
    @Autowired
    private ReactiveDataEntityRepository dataEntityRepository;
    @Autowired
    private DatasetStructureService datasetStructureService;
    private static final EasyRandom EASY_RANDOM;

    static {
        final EasyRandomParameters easyRandomParameters = new EasyRandomParameters();
        easyRandomParameters.excludeField(ofType(JSONB.class));
        EASY_RANDOM = new EasyRandom(easyRandomParameters);
    }

    @Test
    @DisplayName("Test get DatasetVersion from database")
    void testGetDatasetVersion() {
        final DataEntityPojo entityPojo = new DataEntityPojo().setOddrn(UUID.randomUUID().toString());
        final DataEntityPojo dataEntityPojo = dataEntityRepository.bulkCreate(List.of(entityPojo))
            .collectList()
            .block()
            .get(0);

        final DatasetVersionPojo datasetVersionPojo = EASY_RANDOM.nextObject(DatasetVersionPojo.class);
        datasetVersionPojo.setDatasetOddrn(dataEntityPojo.getOddrn());
        final List<DatasetVersionPojo> savedDatasetVersions =
            reactiveDatasetVersionRepository.bulkCreate(List.of(datasetVersionPojo)).collectList().block();
        final DatasetVersionPojo expectedDatasetVersion = savedDatasetVersions.get(0);

        reactiveDatasetVersionRepository.getDatasetVersion(datasetVersionPojo.getId())
            .as(StepVerifier::create)
            .assertNext(datasetStructureDto -> {
                assertThat(datasetStructureDto).isNotNull();
                assertThat(datasetStructureDto.getDatasetVersion()).isEqualTo(expectedDatasetVersion);
                assertThat(datasetStructureDto.getDatasetFields()).isNotNull();
            })
            .verifyComplete();
    }

    @Test
    @DisplayName("Test get Dataset Version from database, expecting dataset version not found")
    void testGetDatasetVersionNotFound() {
        final DatasetVersionPojo datasetVersionPojo = EASY_RANDOM.nextObject(DatasetVersionPojo.class);
        reactiveDatasetVersionRepository.getDatasetVersion(datasetVersionPojo.getId())
            .as(StepVerifier::create)
            .verifyComplete();
    }

    @Test
    @DisplayName("Test get List of DatasetVersion by oddrn from database")
    void testGetVersions() {
        final DataEntityPojo dataEntityPojo = dataEntityRepository
            .bulkCreate(List.of(new DataEntityPojo().setOddrn(UUID.randomUUID().toString())))
            .collectList()
            .block()
            .get(0);
        final List<DatasetVersionPojo> expectedDatasetVersionPojoList = new ArrayList<>();
        for (int i = 0; i < 3; i++) {
            final DatasetVersionPojo datasetVersionPojo = EASY_RANDOM.nextObject(DatasetVersionPojo.class);
            datasetVersionPojo.setDatasetOddrn(dataEntityPojo.getOddrn());
            expectedDatasetVersionPojoList.add(datasetVersionPojo);
        }
        final List<DatasetVersionPojo> savedDatasetVersions =
            reactiveDatasetVersionRepository.bulkCreate(expectedDatasetVersionPojoList).collectList().block();

        reactiveDatasetVersionRepository.getVersions(dataEntityPojo.getOddrn())
            .as(StepVerifier::create)
            .assertNext(datasetVersionPojoList -> {
                assertThat(datasetVersionPojoList).isNotNull();
                assertThat(datasetVersionPojoList).hasSize(3);
                assertThat(datasetVersionPojoList).containsExactlyElementsOf(savedDatasetVersions);
            })
            .verifyComplete();
    }

    @Test
    @DisplayName("Test get latest DatasetVersion by datasetId from database")
    void testGetLatestDatasetVersion() {
        final DataEntityPojo dataEntityPojo = dataEntityRepository
            .bulkCreate(List.of(new DataEntityPojo().setOddrn(UUID.randomUUID().toString())))
            .collectList()
            .block()
            .get(0);
        final List<DatasetVersionPojo> expectedDatasetVersionPojoList = new ArrayList<>();
        for (int i = 0; i < 4; i++) {
            final DatasetVersionPojo datasetVersionPojo = EASY_RANDOM.nextObject(DatasetVersionPojo.class);
            datasetVersionPojo.setDatasetOddrn(dataEntityPojo.getOddrn());
            datasetVersionPojo.setVersion((long) i);
            expectedDatasetVersionPojoList.add(datasetVersionPojo);
        }
        reactiveDatasetVersionRepository.bulkCreate(expectedDatasetVersionPojoList).collectList().block();

        reactiveDatasetVersionRepository.getLatestDatasetVersion(dataEntityPojo.getId())
            .as(StepVerifier::create)
            .assertNext(datasetStructureDto -> {
                assertThat(datasetStructureDto).isNotNull();
                assertThat(datasetStructureDto.getDatasetVersion().getVersion()).isEqualTo(3);
            })
            .verifyComplete();
    }

    @Test
    @DisplayName("Test get latest versions by list of datasetId from database")
    void testGetLatestVersions() {
        final DataEntityPojo dataEntityPojo = dataEntityRepository
            .bulkCreate(List.of(new DataEntityPojo().setOddrn(UUID.randomUUID().toString())))
            .collectList()
            .block()
            .get(0);
        final List<DatasetVersionPojo> expectedDatasetVersionPojoList = new ArrayList<>();
        for (int i = 0; i < 4; i++) {
            final DatasetVersionPojo datasetVersionPojo = EASY_RANDOM.nextObject(DatasetVersionPojo.class);
            datasetVersionPojo.setDatasetOddrn(dataEntityPojo.getOddrn());
            datasetVersionPojo.setVersion((long) i);
            expectedDatasetVersionPojoList.add(datasetVersionPojo);
        }
        reactiveDatasetVersionRepository.bulkCreate(expectedDatasetVersionPojoList).collectList().block();

        reactiveDatasetVersionRepository.getLatestVersions(List.of(dataEntityPojo.getId()))
            .collectList()
            .as(StepVerifier::create)
            .assertNext(datasetVersionPojos -> {
                assertThat(datasetVersionPojos).isNotNull();
                assertThat(datasetVersionPojos).hasSize(1);
                assertThat(datasetVersionPojos)
                    .filteredOn(p -> p.getVersion().equals(3L))
                    .isNotEmpty();
            })
            .verifyComplete();
    }

    @Test
    @DisplayName("Test get latest Dataset Version from database, expecting latest dataset version not found")
    void testGetLatestVersionsNotFound() {
        final DatasetVersionPojo datasetVersionPojo = EASY_RANDOM.nextObject(DatasetVersionPojo.class);
        reactiveDatasetVersionRepository.getLatestDatasetVersion(datasetVersionPojo.getId())
            .as(StepVerifier::create)
            .verifyComplete();
    }

    @Test
    @DisplayName("Test get penaltimate of DatasetVersions list from database")
    void testGetPenaltimate() {
        final DataEntityPojo dataEntityPojo = dataEntityRepository
            .bulkCreate(List.of(new DataEntityPojo().setOddrn(UUID.randomUUID().toString())))
            .collectList()
            .block()
            .get(0);
        final List<DatasetVersionPojo> expectedDatasetVersionPojoList = new ArrayList<>();
        for (int i = 0; i < 4; i++) {
            final DatasetVersionPojo datasetVersionPojo = EASY_RANDOM.nextObject(DatasetVersionPojo.class);
            datasetVersionPojo.setDatasetOddrn(dataEntityPojo.getOddrn());
            datasetVersionPojo.setVersion((long) i);
            expectedDatasetVersionPojoList.add(datasetVersionPojo);
        }
        final List<DatasetVersionPojo> createdDatasetVersionPojos =
            reactiveDatasetVersionRepository.bulkCreate(expectedDatasetVersionPojoList).collectList().block();
        createdDatasetVersionPojos.removeIf(datasetVersionPojo -> datasetVersionPojo.getVersion() == 3L);

        reactiveDatasetVersionRepository.getPenultimateVersions(expectedDatasetVersionPojoList)
            .as(StepVerifier::create)
            .assertNext(penaltimateDatasetVersion -> {
                assertThat(penaltimateDatasetVersion).isNotNull();
                assertThat(penaltimateDatasetVersion).hasSize(3);
                assertThat(penaltimateDatasetVersion).containsExactlyElementsOf(createdDatasetVersionPojos);
            })
            .verifyComplete();
    }

    @Test
    @DisplayName("Test get version id of DatasetVersions list from database")
    void testGetVidToFields() {
        final DataEntityPojo dataEntityPojo = dataEntityRepository
            .bulkCreate(List.of(new DataEntityPojo().setOddrn(UUID.randomUUID().toString())))
            .collectList()
            .block()
            .get(0);

        final DatasetFieldDto datasetFieldDto = createDatasetFieldDto();
        final List<DatasetFieldPojo> datasetFieldPojos = List.of(datasetFieldDto.getDatasetFieldPojo());
        final Map<String, List<DatasetFieldPojo>> datasetFields
             = Map.of(dataEntityPojo.getOddrn(), datasetFieldPojos);

        final DatasetVersionPojo datasetVersionPojo = EASY_RANDOM.nextObject(DatasetVersionPojo.class);
        datasetVersionPojo.setDatasetOddrn(dataEntityPojo.getOddrn());
        datasetVersionPojo.setVersion(1L);
        final List<DatasetVersionPojo> versions = List.of(datasetVersionPojo);

        //create dataset structure
        datasetStructureService.createDatasetStructure(versions, datasetFields).block();

        final Set<Long> datasetPojoIds =
            versions.stream().map(DatasetVersionPojo::getId).collect(Collectors.toSet());
        reactiveDatasetVersionRepository.getDatasetVersionFields(datasetPojoIds)
            .as(StepVerifier::create)
            .assertNext(map -> {
                assertThat(map).isNotNull();
                assertThat(map).hasSize(1);
                assertThat(map.get(datasetVersionPojo.getId()))
                    .usingRecursiveFieldByFieldElementComparator(RecursiveComparisonConfiguration.builder()
                        .withIgnoredFields("id")
                        .withIgnoreAllOverriddenEquals(false)
                        .build())
                    .containsExactlyElementsOf(datasetFieldPojos);
            })
            .verifyComplete();
    }

    private DatasetFieldDto createDatasetFieldDto() {
        final DatasetFieldPojo datasetFieldPojo = EASY_RANDOM.nextObject(DatasetFieldPojo.class);
        final DataSetFieldStat dataSetFieldStat = EASY_RANDOM.nextObject(DataSetFieldStat.class);
        final DataSetFieldType dataSetFieldType = EASY_RANDOM.nextObject(DataSetFieldType.class);
        final LabelPojo labelPojo = EASY_RANDOM.nextObject(LabelPojo.class);
        final DatasetFieldDto datasetFieldDto = new DatasetFieldDto();
        datasetFieldDto.setDatasetFieldPojo(datasetFieldPojo);
        datasetFieldDto.setParentFieldId(1L);
        datasetFieldDto.setEnumValueCount(2);
        datasetFieldDto.setLabels(List.of(new LabelDto(labelPojo, false)));
        datasetFieldDto.getDatasetFieldPojo().setType(jsonb(JSONTestUtils.createJson(dataSetFieldType)));
        datasetFieldDto.getDatasetFieldPojo().setStats(jsonb(JSONTestUtils.createJson(dataSetFieldStat)));
        return datasetFieldDto;
    }
}