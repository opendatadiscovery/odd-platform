package org.opendatadiscovery.oddplatform.api.ingestion;

import java.net.URI;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.BaseIngestionTest;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSetStats;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSource;
import org.opendatadiscovery.oddplatform.api.ingestion.utils.IngestionModelGenerator;
import org.opendatadiscovery.oddplatform.api.ingestion.utils.IngestionModelMapper;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataEntity;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataEntityList;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataEntityType;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataSet;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.MetadataExtension;

import static java.util.Collections.emptyMap;
import static org.assertj.core.api.Assertions.assertThat;

public class MetadataIngestionTest extends BaseIngestionTest {
    /**
     * Simple metadata ingestion test.
     *
     * <p>Flow:
     * 1. Ingests dataset with random metadata, asserts that metadata is ingested.
     * 2. Ingests new metadata set and asserts that old metadata is deleted and new metadata is ingested.
     * 3. Ingests an empty metadata set and asserts that no metadata is present in the data entity
     */
    @Test
    @DisplayName("Simple metadata ingestion test")
    public void simpleMetadataIngestionTest() {
        final DataSource createdDataSource = createDataSource();

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

        assertDataEntityDetailsEqual(expectedDataEntityDetails, (expected, actual) -> {
            assertThat(actual.getVersionList()).hasSize(1);
            assertThat(actual.getVersionList().get(0).getVersion()).isEqualTo(1);
        });

        // ingesting new metadata set with new field values and lacking several old ones
        // at the moment ODD Platform doesn't support several MetadataExtension objects
        final Map<String, Object> newMetadata = Stream.concat(
            datasetToIngest.getMetadata().get(0).getMetadata().entrySet().stream().limit(10),
            IngestionModelGenerator.generateMetadataMap().entrySet().stream()
        ).collect(Collectors.toMap(
            Map.Entry::getKey,
            Map.Entry::getValue,
            (v1, v2) -> v2
        ));

        final URI schemaUrl = datasetToIngest.getMetadata().get(0).getSchemaUrl();

        datasetToIngest.setMetadata(List.of(new MetadataExtension().schemaUrl(schemaUrl).metadata(newMetadata)));

        ingestAndAssert(dataEntityList);

        final var expectedUpdatedDataEntityDetails = IngestionModelMapper
            .buildExpectedBaseDEDetails(foundEntityId, datasetToIngest, createdDataSource)
            .stats(new DataSetStats()
                .consumersCount(0L)
                .fieldsCount((long) datasetToIngest.getDataset().getFieldList().size())
                .rowsCount(datasetToIngest.getDataset().getRowsNumber()));

        assertDataEntityDetailsEqual(expectedUpdatedDataEntityDetails, (expected, actual) -> {
            assertThat(actual.getVersionList()).hasSize(1);
            assertThat(actual.getVersionList().get(0).getVersion()).isEqualTo(1);
        });

        // ingesting empty metadata to assert that no metadata would be present in the data entity
        datasetToIngest.setMetadata(List.of(new MetadataExtension().schemaUrl(schemaUrl).metadata(emptyMap())));

        ingestAndAssert(dataEntityList);

        final var expectedEmptyMetadataDataEntityDetails = IngestionModelMapper
            .buildExpectedBaseDEDetails(foundEntityId, datasetToIngest, createdDataSource)
            .stats(new DataSetStats()
                .consumersCount(0L)
                .fieldsCount((long) datasetToIngest.getDataset().getFieldList().size())
                .rowsCount(datasetToIngest.getDataset().getRowsNumber()));

        assertDataEntityDetailsEqual(expectedEmptyMetadataDataEntityDetails, (expected, actual) -> {
            assertThat(actual.getVersionList()).hasSize(1);
            assertThat(actual.getVersionList().get(0).getVersion()).isEqualTo(1);
        });
    }
}
