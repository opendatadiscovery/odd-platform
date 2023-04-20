package org.opendatadiscovery.oddplatform.api.ingestion;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.BaseIngestionTest;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityDetails;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityGroupLineageList;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityLineage;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityLineageEdge;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityLineageNode;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityLineageStream;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityRef;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSetStats;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSource;
import org.opendatadiscovery.oddplatform.api.ingestion.utils.IngestionModelGenerator;
import org.opendatadiscovery.oddplatform.api.ingestion.utils.IngestionModelMapper;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataEntity;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataEntityGroup;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataEntityList;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataEntityType;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataSet;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataTransformer;

import static java.util.function.Function.identity;
import static org.assertj.core.api.Assertions.assertThat;

public class LineageIngestionTest extends BaseIngestionTest {
    /**
     * Simple lineage ingestion test.
     *
     * <p>Ingests a simple graph of data entities and checks that it was ingested correctly
     * ([inputDataset1] + [inputDataset2]) -> [dataTransformer1] ->
     * [middlewareDataset] -> [dataTransformer2] -> ([outputDataset1] + [outputDataset2])
     *
     * <p>Hollow entities cannot be tested yet since we can't get their ids from the Client API,
     * but we still inject them validating by indirect assertions such as hasSize
     */
    @Test
    @DisplayName("Simple lineage ingestion test")
    public void simpleLineageIngestionTest() {
        final DataSource createdDataSource = createDataSource();

        final DataEntity inputDataset1 = IngestionModelGenerator.generateSimpleDataEntity(DataEntityType.TABLE)
            .dataset(new DataSet().rowsNumber(1_000L).fieldList(IngestionModelGenerator.generateDatasetFields(5)));

        final DataEntity inputDataset2 = IngestionModelGenerator.generateSimpleDataEntity(DataEntityType.TABLE)
            .dataset(new DataSet().rowsNumber(10L).fieldList(IngestionModelGenerator.generateDatasetFields(5)));

        final DataEntity middlewareDataset = IngestionModelGenerator.generateSimpleDataEntity(DataEntityType.TABLE)
            .dataset(new DataSet().rowsNumber(10_000L).fieldList(IngestionModelGenerator.generateDatasetFields(5)));

        final DataEntity outputDataset1 = IngestionModelGenerator.generateSimpleDataEntity(DataEntityType.TABLE)
            .dataset(new DataSet().rowsNumber(5_000L).fieldList(IngestionModelGenerator.generateDatasetFields(5)));

        final DataEntity outputDataset2 = IngestionModelGenerator.generateSimpleDataEntity(DataEntityType.TABLE)
            .dataset(new DataSet().rowsNumber(5_000L).fieldList(IngestionModelGenerator.generateDatasetFields(5)));

        final DataEntity dataTransformer1 = IngestionModelGenerator.generateSimpleDataEntity(DataEntityType.JOB)
            .dataTransformer(new DataTransformer()
                .inputs(List.of(inputDataset1.getOddrn(), inputDataset2.getOddrn(), "hollow_input_oddrn"))
                .outputs(List.of(middlewareDataset.getOddrn(), "hollow_output_oddrn"))
            );

        final DataEntity dataTransformer2 = IngestionModelGenerator.generateSimpleDataEntity(DataEntityType.JOB)
            .dataTransformer(new DataTransformer()
                .inputs(List.of(middlewareDataset.getOddrn()))
                .outputs(List.of(outputDataset1.getOddrn(), outputDataset2.getOddrn()))
            );

        final Map<String, Long> consumersCountMap = Map.of(inputDataset1.getOddrn(), 1L, inputDataset2.getOddrn(), 1L,
            middlewareDataset.getOddrn(), 1L, outputDataset1.getOddrn(), 0L, outputDataset2.getOddrn(), 0L);

        final Map<String, DataEntity> itemsMap = Stream.of(
            inputDataset1, inputDataset2, middlewareDataset,
            dataTransformer1, dataTransformer2, outputDataset1, outputDataset2
        ).collect(Collectors.toMap(DataEntity::getOddrn, identity()));

        final var dataEntityList = new DataEntityList()
            .dataSourceOddrn(createdDataSource.getOddrn())
            .items(new ArrayList<>(itemsMap.values()));

        ingestAndAssert(dataEntityList);

        final Map<String, Long> ingestedEntities = extractIngestedEntitiesAndAssert(createdDataSource, itemsMap.size());

        // assert that all entities were ingested correctly
        itemsMap.forEach((oddrn, dataEntity) -> {
            final Long dataEntityId = ingestedEntities.get(oddrn);
            assertThat(dataEntityId).isNotNull();

            final DataEntityDetails expectedDetails = IngestionModelMapper
                .buildExpectedBaseDEDetails(dataEntityId, dataEntity, createdDataSource);

            if (dataEntity.getDataset() != null) {
                expectedDetails.setStats(new DataSetStats()
                    .consumersCount(consumersCountMap.get(oddrn))
                    .fieldsCount((long) dataEntity.getDataset().getFieldList().size())
                    .rowsCount(dataEntity.getDataset().getRowsNumber()));

                assertDataEntityDetailsEqual(expectedDetails, (expected, actual) -> {
                    assertThat(actual.getVersionList()).hasSize(1);
                    assertThat(actual.getVersionList().get(0).getVersion()).isEqualTo(1);
                });
            }

            if (dataEntity.getDataTransformer() != null) {
                final List<DataEntityRef> sourceList = dataEntity.getDataTransformer().getInputs()
                    .stream()
                    // filtering hollow entities
                    .filter(itemsMap::containsKey)
                    .map(inputOddrn -> buildExpectedDataEntityRef(
                        itemsMap.get(inputOddrn),
                        ingestedEntities.get(inputOddrn)
                    ))
                    .toList();

                final List<DataEntityRef> targetList = dataEntity.getDataTransformer().getOutputs()
                    .stream()
                    // filtering hollow entities
                    .filter(itemsMap::containsKey)
                    .map(outputOddrn -> buildExpectedDataEntityRef(
                        itemsMap.get(outputOddrn),
                        ingestedEntities.get(outputOddrn)
                    ))
                    .toList();

                assertDataEntityDetailsEqual(expectedDetails, (expected, actual) -> {
                    assertThat(actual.getSourceList())
                        .usingRecursiveFieldByFieldElementComparatorIgnoringFields("entityClasses")
                        .hasSameElementsAs(sourceList);

                    assertThat(actual.getTargetList())
                        .usingRecursiveFieldByFieldElementComparatorIgnoringFields("entityClasses")
                        .hasSameElementsAs(targetList);
                });
            }
        });

        final DataEntityLineageNode root = buildExpectedLineageNode(
            ingestedEntities.get(dataTransformer1.getOddrn()),
            dataTransformer1.getOddrn(),
            dataTransformer1.getName(),
            createdDataSource
        );

        final DataEntityLineage expectedDownstream = new DataEntityLineage()
            .root(root)
            .downstream(
                new DataEntityLineageStream()
                    .nodes(List.of(
                        buildExpectedLineageNode(
                            ingestedEntities.get(dataTransformer1.getOddrn()),
                            dataTransformer1.getOddrn(),
                            dataTransformer1.getName(),
                            createdDataSource,
                            3,
                            2
                        ),
                        buildExpectedLineageNode(
                            ingestedEntities.get(middlewareDataset.getOddrn()),
                            middlewareDataset.getOddrn(),
                            middlewareDataset.getName(),
                            createdDataSource,
                            1,
                            1
                        ),
                        buildExpectedLineageNode(
                            ingestedEntities.get(dataTransformer2.getOddrn()),
                            dataTransformer2.getOddrn(),
                            dataTransformer2.getName(),
                            createdDataSource,
                            1,
                            2
                        ),
                        buildExpectedLineageNode(
                            ingestedEntities.get(outputDataset1.getOddrn()),
                            outputDataset1.getOddrn(),
                            outputDataset1.getName(),
                            createdDataSource,
                            1,
                            0
                        ),
                        buildExpectedLineageNode(
                            ingestedEntities.get(outputDataset2.getOddrn()),
                            outputDataset2.getOddrn(),
                            outputDataset2.getName(),
                            createdDataSource,
                            1,
                            0
                        )
                    ))
                    .edges(List.of(
                        buildExpectedLineageEdge(dataTransformer1, middlewareDataset, ingestedEntities),
                        buildExpectedLineageEdge(middlewareDataset, dataTransformer2, ingestedEntities),
                        buildExpectedLineageEdge(dataTransformer2, outputDataset1, ingestedEntities),
                        buildExpectedLineageEdge(dataTransformer2, outputDataset2, ingestedEntities)
                    ))
            );

        final DataEntityLineage expectedUpstream = new DataEntityLineage()
            .root(root)
            .upstream(
                new DataEntityLineageStream()
                    .nodes(List.of(
                        buildExpectedLineageNode(
                            ingestedEntities.get(inputDataset1.getOddrn()),
                            inputDataset1.getOddrn(),
                            inputDataset1.getName(),
                            createdDataSource,
                            0,
                            1
                        ),
                        buildExpectedLineageNode(
                            ingestedEntities.get(inputDataset2.getOddrn()),
                            inputDataset2.getOddrn(),
                            inputDataset2.getName(),
                            createdDataSource,
                            0,
                            1
                        ),
                        buildExpectedLineageNode(
                            ingestedEntities.get(dataTransformer1.getOddrn()),
                            dataTransformer1.getOddrn(),
                            dataTransformer1.getName(),
                            createdDataSource,
                            3,
                            2
                        )
                    ))
                    .edges(List.of(
                        buildExpectedLineageEdge(inputDataset1, dataTransformer1, ingestedEntities),
                        buildExpectedLineageEdge(inputDataset2, dataTransformer1, ingestedEntities)
                    ))
            );

        assertLineage(ingestedEntities.get(dataTransformer1.getOddrn()), expectedDownstream, expectedUpstream);
    }

    /**
     * Simple DEG lineage ingestion test.
     *
     * <p>Ingests a simple graph of data entities inside DEG and checks that it was ingested correctly
     * ([inputDataset1] + [inputDataset2]) -> ([dataTransformer1] + [dataTransformer2]) ->
     * [outputDataset], [separateDataset], [dataTransformer3] -> [inner DEG]
     *
     * <p>DataTransformer2 is not belong to DEG
     *
     * <p>Inner DEG should not be shown in lineage
     */
    @Test
    public void simpleDEGLineageIngestionTest() {
        final DataSource createdDataSource = createDataSource();
        final DataEntity inputDataset1 = IngestionModelGenerator.generateSimpleDataEntity(DataEntityType.TABLE)
            .dataset(new DataSet().rowsNumber(1_000L).fieldList(IngestionModelGenerator.generateDatasetFields(5)));

        final DataEntity inputDataset2 = IngestionModelGenerator.generateSimpleDataEntity(DataEntityType.TABLE)
            .dataset(new DataSet().rowsNumber(10L).fieldList(IngestionModelGenerator.generateDatasetFields(5)));

        final DataEntity outputDataset = IngestionModelGenerator.generateSimpleDataEntity(DataEntityType.TABLE)
            .dataset(new DataSet().rowsNumber(5_000L).fieldList(IngestionModelGenerator.generateDatasetFields(5)));

        final DataEntity separateDataset = IngestionModelGenerator.generateSimpleDataEntity(DataEntityType.TABLE)
            .dataset(new DataSet().rowsNumber(5_000L).fieldList(IngestionModelGenerator.generateDatasetFields(5)));

        final DataEntity innerDEG = IngestionModelGenerator.generateSimpleDataEntity(DataEntityType.DAG)
            .dataEntityGroup(new DataEntityGroup());

        final DataEntity dataTransformer1 = IngestionModelGenerator.generateSimpleDataEntity(DataEntityType.JOB)
            .dataTransformer(new DataTransformer()
                .inputs(List.of(inputDataset1.getOddrn(), inputDataset2.getOddrn()))
                .outputs(List.of(outputDataset.getOddrn()))
            );

        final DataEntity dataTransformer2 = IngestionModelGenerator.generateSimpleDataEntity(DataEntityType.JOB)
            .dataTransformer(new DataTransformer()
                .inputs(List.of(inputDataset1.getOddrn(), inputDataset2.getOddrn()))
                .outputs(List.of(outputDataset.getOddrn()))
            );

        final DataEntity dataTransformer3 = IngestionModelGenerator.generateSimpleDataEntity(DataEntityType.JOB)
            .dataTransformer(new DataTransformer()
                .outputs(List.of(innerDEG.getOddrn()))
            );

        final DataEntity dataEntityGroup = IngestionModelGenerator.generateSimpleDataEntity(DataEntityType.DAG)
            .dataEntityGroup(new DataEntityGroup()
                .entitiesList(List.of(inputDataset1.getOddrn(), inputDataset2.getOddrn(), outputDataset.getOddrn(),
                    dataTransformer1.getOddrn(), separateDataset.getOddrn(), innerDEG.getOddrn(),
                    dataTransformer3.getOddrn()))
            );

        final List<DataEntity> entitiesToIngest = List.of(inputDataset1, inputDataset2, outputDataset, separateDataset,
            dataTransformer1, dataTransformer2, dataTransformer3, dataEntityGroup, innerDEG);
        final var dataEntityList = new DataEntityList()
            .dataSourceOddrn(createdDataSource.getOddrn())
            .items(entitiesToIngest);

        ingestAndAssert(dataEntityList);

        final Map<String, Long> ingestedEntities = extractIngestedEntitiesAndAssert(createdDataSource,
            entitiesToIngest.size());

        final DataEntityGroupLineageList expectedLineage = new DataEntityGroupLineageList();
        final List<DataEntityLineageStream> items = new ArrayList<>();
        final DataEntityLineageStream firstLineage = new DataEntityLineageStream();
        firstLineage.setGroups(List.of());
        firstLineage.setEdges(List.of());
        final DataEntityLineageNode separatedRoot = buildExpectedLineageNode(
            ingestedEntities.get(separateDataset.getOddrn()),
            separateDataset.getOddrn(),
            separateDataset.getName(),
            createdDataSource
        );
        firstLineage.setNodes(List.of(separatedRoot));
        items.add(firstLineage);

        final DataEntityLineageStream secondLineage = new DataEntityLineageStream();
        secondLineage.setGroups(List.of());
        secondLineage.setEdges(List.of(
            buildExpectedLineageEdge(inputDataset1, dataTransformer1, ingestedEntities),
            buildExpectedLineageEdge(inputDataset2, dataTransformer1, ingestedEntities),
            buildExpectedLineageEdge(dataTransformer1, outputDataset, ingestedEntities)
        ));
        secondLineage.setNodes(List.of(
            buildExpectedLineageNode(
                ingestedEntities.get(inputDataset1.getOddrn()),
                inputDataset1.getOddrn(),
                inputDataset1.getName(),
                createdDataSource
            ),
            buildExpectedLineageNode(
                ingestedEntities.get(inputDataset2.getOddrn()),
                inputDataset2.getOddrn(),
                inputDataset2.getName(),
                createdDataSource
            ),
            buildExpectedLineageNode(
                ingestedEntities.get(dataTransformer1.getOddrn()),
                dataTransformer1.getOddrn(),
                dataTransformer1.getName(),
                createdDataSource
            ),
            buildExpectedLineageNode(
                ingestedEntities.get(outputDataset.getOddrn()),
                outputDataset.getOddrn(),
                outputDataset.getName(),
                createdDataSource
            )
        ));
        items.add(secondLineage);

        final DataEntityLineageStream thirdLineage = new DataEntityLineageStream();
        thirdLineage.setGroups(List.of());
        thirdLineage.setEdges(List.of());
        final DataEntityLineageNode transformerNode = buildExpectedLineageNode(
            ingestedEntities.get(dataTransformer3.getOddrn()),
            dataTransformer3.getOddrn(),
            dataTransformer3.getName(),
            createdDataSource
        );
        thirdLineage.setNodes(List.of(transformerNode));
        items.add(thirdLineage);

        expectedLineage.setItems(items);

        assertDEGLineage(ingestedEntities.get(dataEntityGroup.getOddrn()), expectedLineage);
    }

    private void assertDEGLineage(final long dataEntityGroupId,
                                  final DataEntityGroupLineageList expectedLineage) {
        webTestClient.get()
            .uri("/api/dataentitygroups/{data_entity_group_id}/lineage", dataEntityGroupId)
            .exchange()
            .expectBody(DataEntityGroupLineageList.class)
            .value(actual -> assertThat(actual)
                .usingRecursiveComparison()
                .ignoringCollectionOrder()
                .ignoringFields(
                    "items.nodes.entityClasses",
                    "items.nodes.dataSource.token")
                .isEqualTo(expectedLineage)
            );
    }

    private void assertLineage(final long dataEntityId,
                               final DataEntityLineage expectedDownstream,
                               final DataEntityLineage expectedUpstream) {
        webTestClient.get()
            .uri("/api/dataentities/{data_entity_id}/lineage/downstream?lineage_depth=100", dataEntityId)
            .exchange()
            .expectBody(DataEntityLineage.class)
            .value(actual -> {
                assertThat(actual.getRoot())
                    .usingRecursiveComparison()
                    .ignoringFields("dataSource.token", "entityClasses", "groupIdList")
                    .isEqualTo(expectedDownstream.getRoot());

                assertThat(actual.getDownstream().getEdges())
                    .containsAll(expectedDownstream.getDownstream().getEdges())
                    // indirect sign of hollow entity in the downstream
                    .hasSize(expectedDownstream.getDownstream().getEdges().size() + 1);

                assertThat(actual.getDownstream().getNodes())
                    .usingRecursiveFieldByFieldElementComparatorIgnoringFields("dataSource.token", "entityClasses")
                    .containsAll(expectedDownstream.getDownstream().getNodes())
                    // indirect sign of hollow entity in the downstream
                    .hasSize(expectedDownstream.getDownstream().getNodes().size() + 1);
            });

        webTestClient.get()
            .uri("/api/dataentities/{data_entity_id}/lineage/upstream?lineage_depth=100", dataEntityId)
            .exchange()
            .expectBody(DataEntityLineage.class)
            .value(actual -> {
                assertThat(actual.getRoot())
                    .usingRecursiveComparison()
                    .ignoringFields("dataSource.token", "entityClasses", "groupIdList")
                    .isEqualTo(expectedUpstream.getRoot());

                assertThat(actual.getDownstream()).isNull();

                assertThat(actual.getUpstream().getEdges())
                    .containsAll(expectedUpstream.getUpstream().getEdges())
                    // indirect sign of hollow entity in the upstream
                    .hasSize(expectedUpstream.getUpstream().getEdges().size() + 1);

                assertThat(actual.getUpstream().getNodes())
                    .usingRecursiveFieldByFieldElementComparatorIgnoringFields("dataSource.token", "entityClasses")
                    .containsAll(expectedUpstream.getUpstream().getNodes())
                    // indirect sign of hollow entity in the upstream
                    .hasSize(expectedUpstream.getUpstream().getNodes().size() + 1);
            });
    }

    private DataEntityLineageEdge buildExpectedLineageEdge(final DataEntity source,
                                                           final DataEntity target,
                                                           final Map<String, Long> idMap) {
        return new DataEntityLineageEdge()
            .sourceId(idMap.get(source.getOddrn()))
            .targetId(idMap.get(target.getOddrn()));
    }

    private DataEntityLineageNode buildExpectedLineageNode(final long id,
                                                           final String oddrn,
                                                           final String name,
                                                           final DataSource dataSource) {
        return buildExpectedLineageNode(id, oddrn, name, dataSource, null, null);
    }

    private DataEntityLineageNode buildExpectedLineageNode(final long id,
                                                           final String oddrn,
                                                           final String name,
                                                           final DataSource dataSource,
                                                           final Integer parentsCount,
                                                           final Integer childrenCount) {
        return new DataEntityLineageNode()
            .id(id)
            .oddrn(oddrn)
            .externalName(name)
            .dataSource(dataSource)
            .parentsCount(parentsCount)
            .childrenCount(childrenCount);
    }
}
