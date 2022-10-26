package org.opendatadiscovery.oddplatform.api.ingestion;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections4.ListUtils;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.BaseIngestionTest;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSetStats;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSetStructure;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSetVersion;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSource;
import org.opendatadiscovery.oddplatform.api.contract.model.Label;
import org.opendatadiscovery.oddplatform.api.ingestion.utils.IngestionModelGenerator;
import org.opendatadiscovery.oddplatform.api.ingestion.utils.IngestionModelMapper;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataEntity;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataEntityList;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataEntityType;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataSet;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataSetField;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DatasetStatisticsList;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.Tag;

import static java.util.Collections.emptyList;
import static java.util.stream.Collectors.toMap;
import static org.assertj.core.api.Assertions.assertThat;

@Slf4j
public class ExternalStatisticsIngestionTest extends BaseIngestionTest {
    /**
     * Preserve external labels state from different ingestion endpoints test.
     *
     * <p>Test ingests metadata with statistics and tags via standard Ingestion API endpoint
     * and asserts correct ingestion process
     *
     * <p>Then it ingests statistics and tags via Ingestion Statistics API endpoint and asserts
     * that statistics is updated and labels' states are not mixed
     *
     * <p>Then it ingests the original payload via standard Ingestion API endpoint and asserts
     * that labels' states are the same
     */
    @Test
    @DisplayName("Test whether statistics and tags from different ingestion endpoints do not mix their states")
    public void externalStatisticsLabelStateIngestionTest() {
        final DataSource createdDataSource = createDataSource();

        final DataEntity datasetToIngest = IngestionModelGenerator
            .generateSimpleDataEntity(DataEntityType.TABLE)
            .dataset(new DataSet().fieldList(IngestionModelGenerator.generateDatasetFields(5)).rowsNumber(1000L));

        final var dataEntityList = new DataEntityList()
            .dataSourceOddrn(createdDataSource.getOddrn())
            .items(List.of(datasetToIngest));

        // Ingest a simple dataset with generated statistics and tags
        // via standard Ingestion API endpoint
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

        // build statistics and ingest it via Ingestion Statistics API
        final Map<String, List<String>> fieldToLabelNames = datasetToIngest.getDataset().getFieldList()
            .stream()
            .collect(toMap(
                DataSetField::getOddrn,
                // adding 5 new labels and removing half of old ones
                // basically mixing new and old labels together to make assumptions later
                d -> mixLabelState(d.getTags().stream().map(Tag::getName).toList(), 5, d.getTags().size() / 2)
            ));

        final DatasetStatisticsList statistics = IngestionModelGenerator.generateDatasetStatisticsList(
            datasetToIngest.getOddrn(),
            fieldToLabelNames
        );

        ingestStatistics(statistics);

        assertDataEntityDetailsEqual(expectedDataEntityDetails, (expected, actual) -> {
            assertThat(actual.getVersionList()).hasSize(1);
            assertThat(actual.getVersionList().get(0).getVersion()).isEqualTo(1);
        });

        final Map<String, List<String>> originalLabelState = datasetToIngest.getDataset().getFieldList()
            .stream()
            .collect(toMap(DataSetField::getOddrn, df -> df.getTags().stream().map(Tag::getName).toList()));

        final Map<String, List<Label>> expectedLabelState = fieldToLabelNames.entrySet()
            .stream()
            .collect(toMap(
                Map.Entry::getKey,
                e -> mapLabels(mergeLists(e.getValue(), originalLabelState.getOrDefault(e.getKey(), emptyList())))
            ));

        final DataSetStructure expectedMergedStructure = new DataSetStructure()
            .dataSetVersion(new DataSetVersion().version(1))
            .fieldList(datasetToIngest.getDataset().getFieldList().stream()
                .map(IngestionModelMapper::buildExpectedDataSetField)
                .peek(d -> d.setLabels(expectedLabelState.get(d.getOddrn())))
                .peek(d -> d.setStats(IngestionModelMapper.buildExpectedDataSetFieldStat(
                    statistics.getItems().get(0).getFields().get(d.getOddrn()))))
                .toList());

        assertDatasetStructuresEqual(foundEntityId, expectedMergedStructure);

        // Ingest original payload to assert that labels does not change
        ingestAndAssert(dataEntityList);

        assertDataEntityDetailsEqual(expectedDataEntityDetails, (expected, actual) -> {
            assertThat(actual.getVersionList()).hasSize(1);
            assertThat(actual.getVersionList().get(0).getVersion()).isEqualTo(1);
        });

        final DataSetStructure expectedOriginalStructure = new DataSetStructure()
            .dataSetVersion(new DataSetVersion().version(1))
            .fieldList(datasetToIngest.getDataset().getFieldList().stream()
                .map(IngestionModelMapper::buildExpectedDataSetField)
                .peek(d -> d.setLabels(expectedLabelState.get(d.getOddrn())))
                .toList());

        assertDatasetStructuresEqual(foundEntityId, expectedOriginalStructure);
    }

    private List<Label> mapLabels(final List<String> labelNames) {
        return labelNames.stream()
            .map(ln -> new Label().name(ln).external(true))
            .toList();
    }

    private <T> List<T> mergeLists(final List<T> l1, final List<T> l2) {
        final HashSet<T> res = new HashSet<>();

        res.addAll(l1);
        res.addAll(l2);

        return new ArrayList<>(res);
    }

    private List<String> mixLabelState(final List<String> currentLabels,
                                       final int appendedLabelsCount,
                                       final int trimmedLabelSize) {
        final List<String> appendedLabels = IngestionModelGenerator
            .generateDataSetFieldLabels(appendedLabelsCount).stream()
            .map(Tag::getName)
            .toList();

        return ListUtils.union(
            currentLabels.subList(0, currentLabels.size() - trimmedLabelSize),
            appendedLabels
        );
    }
}
