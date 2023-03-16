package org.opendatadiscovery.oddplatform.api.ingestion;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import org.apache.commons.collections4.MapUtils;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.BaseIngestionTest;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityClass;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityClassUsageInfo;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityDetails;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityGroupFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityRef;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityTypeUsageInfo;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityUsageInfo;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSource;
import org.opendatadiscovery.oddplatform.api.ingestion.utils.IngestionModelGenerator;
import org.opendatadiscovery.oddplatform.dto.DataEntityClassDto;
import org.opendatadiscovery.oddplatform.dto.DataEntityTypeDto;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataConsumer;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataEntity;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataEntityGroup;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataEntityList;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataEntityType;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataQualityTest;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataSet;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataTransformer;
import reactor.core.publisher.Mono;

import static org.assertj.core.api.Assertions.assertThat;

public class DataEntityStatisticsTest extends BaseIngestionTest {

    /**
     * 1. Ingest different data entities with different classes and types. Ingest hollow entities as well.
     * 2. Validate statistics
     * 3. Update entity classes and types, make hollow entity normal
     * 4. Validate statistics
     * 5. Create data entity group
     * 6. Validate statistics
     * 7. Update data entity group
     * 8. Validate statistics
     * 9. Delete data entity group
     * 10. Validate statistics
     */
    @Test
    public void dataEntityStatisticsTest() {
        final DataSource createdDataSource = createDataSource();
        final String hollowDatasetOddrn = UUID.randomUUID().toString();

        final DataEntity firstTable = IngestionModelGenerator.generateSimpleDataEntity(DataEntityType.TABLE)
            .dataset(new DataSet());
        final DataEntity firstView = IngestionModelGenerator.generateSimpleDataEntity(DataEntityType.VIEW)
            .dataset(new DataSet())
            .dataTransformer(new DataTransformer());
        final DataEntity secondView = IngestionModelGenerator.generateSimpleDataEntity(DataEntityType.VIEW)
            .dataTransformer(new DataTransformer());
        final DataEntity firstJob = IngestionModelGenerator.generateSimpleDataEntity(DataEntityType.JOB)
            .dataQualityTest(new DataQualityTest());
        final DataEntity secondJob = IngestionModelGenerator.generateSimpleDataEntity(DataEntityType.JOB)
            .dataTransformer(new DataTransformer().inputs(List.of(hollowDatasetOddrn)));
        final DataEntity firstDAG = IngestionModelGenerator.generateSimpleDataEntity(DataEntityType.DAG)
            .dataEntityGroup(new DataEntityGroup());
        final DataEntity firstDashboard = IngestionModelGenerator.generateSimpleDataEntity(DataEntityType.DASHBOARD)
            .dataConsumer(new DataConsumer().inputs(List.of(hollowDatasetOddrn)));

        final List<DataEntity> dataEntities =
            List.of(firstTable, firstView, secondView, firstJob, secondJob, firstDAG, firstDashboard);
        final var entityList = new DataEntityList()
            .dataSourceOddrn(createdDataSource.getOddrn())
            .items(dataEntities);

        ingestAndAssert(entityList);

        assertStatistics(dataEntities);

        // Update data entities
        firstTable.setType(DataEntityType.FILE);
        final DataEntity updatedHollow = IngestionModelGenerator.generateSimpleDataEntity(DataEntityType.VIEW)
            .oddrn(hollowDatasetOddrn)
            .dataset(new DataSet());

        final List<DataEntity> updatedDataEntity = List.of(firstTable, firstView, secondView, updatedHollow);
        final var updatedEntityList = new DataEntityList()
            .dataSourceOddrn(createdDataSource.getOddrn())
            .items(updatedDataEntity);

        ingestAndAssert(updatedEntityList);

        final List<DataEntity> afterUpdated = new ArrayList<>(dataEntities);
        afterUpdated.add(updatedHollow);
        assertStatistics(afterUpdated);

        // Create DEG
        final DataEntityGroupFormData formData = new DataEntityGroupFormData();
        formData.setName("name");
        formData.setType(new org.opendatadiscovery.oddplatform.api.contract.model.DataEntityType()
            .id(DataEntityTypeDto.DAG.getId())
            .name(org.opendatadiscovery.oddplatform.api.contract.model.DataEntityType.NameEnum.fromValue(
                DataEntityTypeDto.DAG.name())));
        formData.setEntities(List.of(new DataEntityRef().id(1L).oddrn(hollowDatasetOddrn)));

        final DataEntityRef deg = createDEG(formData);

        final List<DataEntity> afterDEGCreated = new ArrayList<>(dataEntities);
        afterDEGCreated.add(updatedHollow);
        afterDEGCreated.add(new DataEntity().type(DataEntityType.DAG).dataEntityGroup(new DataEntityGroup()));
        assertStatistics(afterDEGCreated);

        // Update DEG type
        formData.setType(new org.opendatadiscovery.oddplatform.api.contract.model.DataEntityType()
            .id(DataEntityTypeDto.MICROSERVICE.getId())
            .name(org.opendatadiscovery.oddplatform.api.contract.model.DataEntityType.NameEnum.fromValue(
                DataEntityTypeDto.MICROSERVICE.name())));

        updateDEG(deg.getId(), formData);

        final List<DataEntity> afterDEGUpdated = new ArrayList<>(dataEntities);
        afterDEGUpdated.add(updatedHollow);
        afterDEGUpdated.add(new DataEntity().type(DataEntityType.MICROSERVICE).dataEntityGroup(new DataEntityGroup()));

        assertStatistics(afterDEGUpdated);

        // Delete DEG
        final DataEntityDetails details = getDetails(deg.getId());
        removeEntityFromDEG(details.getEntities().get(0).getId(), deg.getId());
        deleteDeg(deg.getId());

        final List<DataEntity> afterDEGDeleted = new ArrayList<>(dataEntities);
        afterDEGDeleted.add(updatedHollow);

        assertStatistics(afterDEGDeleted);
    }

    private void assertStatistics(final List<DataEntity> list) {
        webTestClient.get()
            .uri("/api/dataentities/usage")
            .exchange()
            .expectStatus().isOk()
            .expectBody(DataEntityUsageInfo.class)
            .value(info -> {
                final Map<Integer, Map<Integer, Long>> map = buildExpectedMap(list);
                final DataEntityUsageInfo expected = buildExpectedUsageInfo(map, list.size());
                assertThat(info)
                    .usingRecursiveComparison()
                    .ignoringFields("unfilledCount", "dataEntityClassesInfo.entityClass.types")
                    .ignoringCollectionOrder()
                    .isEqualTo(expected);
            });
    }

    private DataEntityRef createDEG(final DataEntityGroupFormData formData) {
        return webTestClient.post()
            .uri("/api/dataentitygroups")
            .body(Mono.just(formData), DataEntityGroupFormData.class)
            .exchange()
            .returnResult(DataEntityRef.class)
            .getResponseBody()
            .single()
            .block();
    }

    private void updateDEG(final Long id, final DataEntityGroupFormData formData) {
        webTestClient.put()
            .uri("/api/dataentitygroups/{id}", id)
            .body(Mono.just(formData), DataEntityGroupFormData.class)
            .exchange()
            .expectStatus().isOk();
    }

    private void deleteDeg(final Long id) {
        webTestClient.delete()
            .uri("/api/dataentitygroups/{id}", id)
            .exchange()
            .expectStatus().isNoContent();
    }

    private DataEntityDetails getDetails(final Long degId) {
        return webTestClient.get()
            .uri("/api/dataentities/{data_entity_id}", degId)
            .exchange()
            .returnResult(DataEntityDetails.class)
            .getResponseBody()
            .single()
            .block();
    }

    private void removeEntityFromDEG(final Long dataEntityId, final Long degId) {
        webTestClient.delete()
            .uri("/api/dataentities/{data_entity_id}/data_entity_group/{data_entity_group_id}", dataEntityId, degId)
            .exchange()
            .expectStatus().isNoContent();
    }

    private Map<Integer, Map<Integer, Long>> buildExpectedMap(final List<DataEntity> dataEntities) {
        final Map<Integer, Map<Integer, Long>> result = Arrays.stream(DataEntityClassDto.values())
            .filter(classDto -> classDto != DataEntityClassDto.DATA_QUALITY_TEST_RUN
                && classDto != DataEntityClassDto.DATA_TRANSFORMER_RUN)
            .collect(Collectors.toMap(DataEntityClassDto::getId, e -> new HashMap<>()));
        dataEntities.forEach(de -> {
            final DataEntityTypeDto type = DataEntityTypeDto.valueOf(de.getType().getValue());
            final List<DataEntityClassDto> classDtos = new ArrayList<>();
            if (de.getDataset() != null) {
                classDtos.add(DataEntityClassDto.DATA_SET);
            }
            if (de.getDataTransformer() != null) {
                classDtos.add(DataEntityClassDto.DATA_TRANSFORMER);
            }
            if (de.getDataQualityTest() != null) {
                classDtos.add(DataEntityClassDto.DATA_QUALITY_TEST);
            }
            if (de.getDataConsumer() != null) {
                classDtos.add(DataEntityClassDto.DATA_CONSUMER);
            }
            if (de.getDataInput() != null) {
                classDtos.add(DataEntityClassDto.DATA_INPUT);
            }
            if (de.getDataEntityGroup() != null) {
                classDtos.add(DataEntityClassDto.DATA_ENTITY_GROUP);
            }
            classDtos.forEach(dto -> {
                final Map<Integer, Long> map = result.computeIfAbsent(dto.getId(), HashMap::new);
                map.merge(type.getId(), 1L, Long::sum);
            });
        });
        return result;
    }

    private DataEntityUsageInfo buildExpectedUsageInfo(final Map<Integer, Map<Integer, Long>> usages,
                                                       final long totalCount) {
        final DataEntityUsageInfo usageInfo = new DataEntityUsageInfo();
        usageInfo.setTotalCount(totalCount);
        final List<DataEntityClassUsageInfo> classUsageInfos = usages.entrySet().stream().map(entry -> {
            final DataEntityClassDto classDto = DataEntityClassDto.findById(entry.getKey()).orElseThrow();
            return expectedClassUsageInfo(classDto, entry.getValue());
        }).toList();
        usageInfo.setDataEntityClassesInfo(classUsageInfos);
        return usageInfo;
    }

    private DataEntityClassUsageInfo expectedClassUsageInfo(final DataEntityClassDto classDto,
                                                            final Map<Integer, Long> typesCount) {
        final DataEntityClassUsageInfo classUsageInfo = new DataEntityClassUsageInfo();
        classUsageInfo.setEntityClass(
            new DataEntityClass().id(classDto.getId())
                .name(DataEntityClass.NameEnum.fromValue(classDto.name()))
        );
        if (MapUtils.isEmpty(typesCount)) {
            classUsageInfo.setTotalCount(0L);
            classUsageInfo.setDataEntityTypesInfo(List.of());
            return classUsageInfo;
        }
        final List<DataEntityTypeUsageInfo> dataEntityTypeUsageInfo =
            typesCount.entrySet().stream().map(type -> {
                final DataEntityTypeUsageInfo typeUsageInfo = new DataEntityTypeUsageInfo();
                typeUsageInfo.setTotalCount(type.getValue());
                final DataEntityTypeDto dataEntityTypeDto = DataEntityTypeDto.findById(type.getKey()).orElseThrow();
                typeUsageInfo.setEntityType(new org.opendatadiscovery.oddplatform.api.contract.model.DataEntityType()
                    .id(dataEntityTypeDto.getId())
                    .name(org.opendatadiscovery.oddplatform.api.contract.model.DataEntityType.NameEnum.fromValue(
                        dataEntityTypeDto.name()))
                );
                return typeUsageInfo;
            }).toList();
        classUsageInfo.setDataEntityTypesInfo(dataEntityTypeUsageInfo);
        classUsageInfo.setTotalCount(typesCount.values().stream().reduce(Long::sum).orElseThrow());
        return classUsageInfo;
    }
}
