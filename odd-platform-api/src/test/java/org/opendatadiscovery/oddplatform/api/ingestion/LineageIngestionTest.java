package org.opendatadiscovery.oddplatform.api.ingestion;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.BaseIngestionTest;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityDetails;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityLineage;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityLineageNode;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityLineageStream;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityRef;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSetStats;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSource;
import org.opendatadiscovery.oddplatform.api.ingestion.utils.IngestionModelGenerator;
import org.opendatadiscovery.oddplatform.api.ingestion.utils.IngestionModelMapper;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataEntity;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataEntityList;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataEntityType;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataSet;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataTransformer;

import static java.util.function.Function.identity;
import static org.assertj.core.api.Assertions.assertThat;

public class LineageIngestionTest extends BaseIngestionTest {
    /**
     * Simple lineage ingestion test.
     * Ingests a simple graph of data entities and checks that it was ingested correctly
     * ([inputDataset1] + [inputDataset2]) -> [dataTransformer1] -> [middlewareDataset] -> [dataTransformer2] -> ([outputDataset1] + [outputDataset2])
     * <p>
     * Hollow entities cannot be tested yet since we can't get their ids from the Client API
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

        final Map<String, DataEntity> itemsMap = Stream
            .of(
                inputDataset1, inputDataset2, middlewareDataset,
                dataTransformer1, dataTransformer2, outputDataset1, outputDataset2
            )
            .collect(Collectors.toMap(DataEntity::getOddrn, identity()));

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
                    .consumersCount(0L)
                    .fieldsCount((long) dataEntity.getDataset().getFieldList().size())
                    .rowsCount(dataEntity.getDataset().getRowsNumber()));
            }

            if (dataEntity.getDataTransformer() != null) {
                final List<DataEntityRef> inputList = dataEntity.getDataTransformer().getInputs()
                    .stream()
                    .map(inputOddrn -> buildExpectedDataEntityRef(
                        itemsMap.get(inputOddrn),
                        ingestedEntities.get(inputOddrn)
                    ))
                    .toList();

                final List<DataEntityRef> outputList = dataEntity.getDataTransformer().getOutputs()
                    .stream()
                    .peek(System.out::println)
                    .map(outputOddrn -> buildExpectedDataEntityRef(
                        itemsMap.get(outputOddrn),
                        ingestedEntities.get(outputOddrn)
                    ))
                    .toList();

                expectedDetails.setInputList(inputList);
                expectedDetails.setOutputList(outputList);
            }

            assertDataEntityDetailsEqual(expectedDetails);
        });

        final DataEntityLineage expectedDownstream = new DataEntityLineage()
            .downstream(
                new DataEntityLineageStream()
                    .nodes(List.of(new DataEntityLineageNode()))
            );

        final DataEntityLineage expectedUpstream = new DataEntityLineage()
            .upstream(
                new DataEntityLineageStream()
                    .nodes(List.of(new DataEntityLineageNode()))
            );

        // assert that all relationships were ingested correctly
//        assertLineage(ingestedEntities.get(dataTransformer1.getOddrn()), expectedDownstream, expectedUpstream);
    }

    private DataEntityRef buildExpectedDataEntityRef(final DataEntity ingestedEntity, final long ingestedId) {
        return new DataEntityRef()
            .id(ingestedId)
            .oddrn(ingestedEntity.getOddrn())
            .externalName(ingestedEntity.getName())
            .hasAlerts(false)
            .manuallyCreated(false);
    }

    private void assertLineage(final long dataEntityId,
                               final DataEntityLineage expectedDownstream,
                               final DataEntityLineage expectedUpstream) {
        webTestClient.get()
            .uri("/api/dataentities/{data_entity_id}/lineage/downstream?lineage_depth=100", dataEntityId)
            .exchange()
            .expectBody(DataEntityLineage.class)
            .value(actual -> assertThat(actual).isEqualTo(expectedDownstream));

        webTestClient.get()
            .uri("/api/dataentities/{data_entity_id}/lineage/upstream?lineage_depth=100", dataEntityId)
            .exchange()
            .expectBody(DataEntityLineage.class)
            .value(actual -> assertThat(actual).isEqualTo(expectedUpstream));
    }

    private DataEntityLineageNode buildLineageNode(final long dataEntityId,
                                                   final DataEntity dataEntity) {
        return new DataEntityLineageNode()
            .id(dataEntityId)
            .externalName(dataEntity.getName())
            // TODO: fill
            .entityClasses(Collections.emptyList());
    }
}
