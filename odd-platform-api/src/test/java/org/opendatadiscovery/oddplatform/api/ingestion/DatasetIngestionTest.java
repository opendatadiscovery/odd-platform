package org.opendatadiscovery.oddplatform.api.ingestion;

import java.util.Comparator;
import java.util.List;
import org.apache.commons.collections4.ListUtils;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.BaseIngestionTest;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSetField;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSetStats;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSetStructure;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSetVersion;
import org.opendatadiscovery.oddplatform.api.ingestion.utils.IngestionModelGenerator;
import org.opendatadiscovery.oddplatform.api.ingestion.utils.IngestionModelMapper;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataEntity;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataEntityList;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataEntityType;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataSet;

import static org.assertj.core.api.Assertions.assertThat;

public class DatasetIngestionTest extends BaseIngestionTest {
    /**
     * Simple dataset ingestion test.
     * It injects a simple dataset, checks that it was ingested correctly
     * and repeats the injecting request asserting idempotency of the platform regarding the dataset structure.
     */
    @Test
    @DisplayName("Simple dataset ingestion test")
    public void simpleDatasetIngestionTest() {
        final var createdDataSource = createDataSource();

        final DataEntity datasetToIngest = IngestionModelGenerator
            .generateSimpleDataEntity(DataEntityType.TABLE)
            .type(DataEntityType.TABLE)
            .dataset(new DataSet().fieldList(IngestionModelGenerator.generateDatasetFields(5)).rowsNumber(1000L));

        final var dataEntityList = new DataEntityList()
            .dataSourceOddrn(createdDataSource.getOddrn())
            .items(List.of(datasetToIngest));

        ingestAndAssert(dataEntityList);

        final long foundEntityId = extractIngestedEntityIdAndAssert(createdDataSource);

        final var expectedDataEntityDetails = IngestionModelMapper
            .buildExpectedBaseDEDetails(foundEntityId, datasetToIngest, createdDataSource)
            .stats(new DataSetStats()
                .consumersCount(0L)
                .fieldsCount((long) datasetToIngest.getDataset().getFieldList().size())
                .rowsCount(datasetToIngest.getDataset().getRowsNumber()));

        final var expectedDataStructure = new DataSetStructure()
            .dataSetVersion(new DataSetVersion().version(1))
            .fieldList(datasetToIngest.getDataset().getFieldList().stream()
                .map(IngestionModelMapper::buildExpectedDataSetField).toList());

        assertDataEntityDetailsEqual(expectedDataEntityDetails, (expected, actual) -> {
            assertThat(actual.getVersionList()).hasSize(1);
            assertThat(actual.getVersionList().get(0).getVersion()).isEqualTo(1);
        });
        assertDatasetStructuresEqual(foundEntityId, expectedDataStructure);

        // injecting the same metadata to make sure no new entities or dataset structures are being created
        ingestAndAssert(dataEntityList);

        assertDataEntityDetailsEqual(expectedDataEntityDetails, (expected, actual) -> {
            assertThat(actual.getVersionList()).hasSize(1);
            assertThat(actual.getVersionList().get(0).getVersion()).isEqualTo(1);
        });
        assertDatasetStructuresEqual(foundEntityId, expectedDataStructure);
    }

    /**
     * Test ingests dataset, asserts that it was ingested correctly
     * and then ingests the same dataset with a new version asserting that the dataset structure was updated.
     */
    @Test
    @DisplayName("Changing dataset structure")
    public void changeDatasetStructureTest() {
        final var createdDataSource = createDataSource();

        final DataEntity datasetToIngest = IngestionModelGenerator
            .generateSimpleDataEntity(DataEntityType.TABLE)
            .dataset(new DataSet().fieldList(IngestionModelGenerator.generateDatasetFields(5)).rowsNumber(1000L));

        final var dataEntityList = new DataEntityList()
            .dataSourceOddrn(createdDataSource.getOddrn())
            .items(List.of(datasetToIngest));

        ingestAndAssert(dataEntityList);

        final long foundEntityId = extractIngestedEntityIdAndAssert(createdDataSource);

        final var expectedDataEntityDetails = IngestionModelMapper
            .buildExpectedBaseDEDetails(foundEntityId, datasetToIngest, createdDataSource)
            .stats(new DataSetStats()
                .consumersCount(0L)
                .fieldsCount((long) datasetToIngest.getDataset().getFieldList().size())
                .rowsCount(datasetToIngest.getDataset().getRowsNumber()));

        final var expectedDataStructure = new DataSetStructure()
            .dataSetVersion(new DataSetVersion().version(1))
            .fieldList(datasetToIngest.getDataset().getFieldList().stream()
                .map(IngestionModelMapper::buildExpectedDataSetField).toList());

        assertDataEntityDetailsEqual(expectedDataEntityDetails, (expected, actual) -> {
            assertThat(actual.getVersionList()).hasSize(1);
            assertThat(actual.getVersionList().get(0).getVersion()).isEqualTo(1);
        });
        assertDatasetStructuresEqual(foundEntityId, expectedDataStructure);

        final var newFields = ListUtils.union(
            datasetToIngest.getDataset().getFieldList().subList(0, 2),
            IngestionModelGenerator.generateDatasetFields(2)
        );

        datasetToIngest.getDataset().setFieldList(newFields);

        // ingesting new dataset structure containing new fields and lacking several old ones
        ingestAndAssert(dataEntityList);

        final var updatedExpectedDataEntityDetails = IngestionModelMapper
            .buildExpectedBaseDEDetails(foundEntityId, datasetToIngest, createdDataSource)
            .stats(new DataSetStats()
                .consumersCount(0L)
                .fieldsCount((long) datasetToIngest.getDataset().getFieldList().size())
                .rowsCount(datasetToIngest.getDataset().getRowsNumber()));

        final var updatedExpectedDataStructure = new DataSetStructure()
            .dataSetVersion(new DataSetVersion().version(2))
            .fieldList(datasetToIngest.getDataset().getFieldList().stream()
                .map(IngestionModelMapper::buildExpectedDataSetField).toList());

        assertDataEntityDetailsEqual(updatedExpectedDataEntityDetails, (expected, actual) -> {
            assertThat(actual.getVersionList()).hasSize(2);
            assertThat(actual.getVersionList().get(0).getVersion()).isEqualTo(1);
            assertThat(actual.getVersionList().get(1).getVersion()).isEqualTo(2);
        });

        assertDatasetStructuresEqual(foundEntityId, updatedExpectedDataStructure);
    }

    private void assertDatasetStructuresEqual(final long dataEntityId, final DataSetStructure expected) {
        webTestClient.get()
            .uri("/api/datasets/{dataset_id}/structure", dataEntityId)
            .exchange()
            .expectStatus().isOk()
            .expectBody(DataSetStructure.class)
            .value(actual -> {
                assertThat(expected.getDataSetVersion())
                    .usingRecursiveComparison()
                    .ignoringFields("id", "createdAt")
                    .isEqualTo(actual.getDataSetVersion());

                assertThat(actual.getFieldList()).hasSize(expected.getFieldList().size());

                final List<DataSetField> sortedActualFields = actual.getFieldList().stream()
                    .sorted(Comparator.comparing(DataSetField::getOddrn))
                    .toList();

                final List<DataSetField> sortedExpectedFields = expected.getFieldList().stream()
                    .sorted(Comparator.comparing(DataSetField::getOddrn))
                    .toList();

                for (int i = 0; i < sortedActualFields.size(); i++) {
                    final DataSetField expectedField = sortedExpectedFields.get(i);
                    final DataSetField actualField = sortedActualFields.get(i);

                    assertThat(actualField)
                        .usingRecursiveComparison()
                        .ignoringFields("id", "labels")
                        .isEqualTo(expectedField);

                    assertThat(actualField.getLabels())
                        .usingRecursiveFieldByFieldElementComparatorIgnoringFields("id")
                        .hasSameElementsAs(expectedField.getLabels());
                }
            });
    }
}