package org.opendatadiscovery.oddplatform.api.ingestion;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.BaseIngestionTest;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSource;
import org.opendatadiscovery.oddplatform.api.ingestion.utils.IngestionModelGenerator;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.Bucket;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataEntity;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataEntityList;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataEntityType;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataSet;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.MetricPoint;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.MetricSet;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.MetricSetList;
import org.springframework.core.io.ClassPathResource;
import org.testcontainers.shaded.com.fasterxml.jackson.databind.ObjectMapper;

import static org.opendatadiscovery.oddplatform.api.ingestion.utils.IngestionMetricModelMapper.buildExpectedMetricSet;

public class MetricsIngestionTest extends BaseIngestionTest {
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Simple gauge and counter metrics ingestion test
     *
     * <p>Flow:
     * 1. Ingests random data entity
     * 2. Ingests new gauge and counter metrics, validates that they are properly saved
     * 3. Ingests the same metrics with timestamp less than before, validates, that values are NOT updated
     * 4. Ingests the same metrics with new timestamp, validates, that values are updated
     */
    @Test
    public void gaugeAndCounterTest() throws IOException {
        final DataSource createdDataSource = createDataSource();

        final DataEntity datasetToIngest = IngestionModelGenerator
            .generateSimpleDataEntity(DataEntityType.TABLE)
            .dataset(new DataSet().fieldList(IngestionModelGenerator.generateDatasetFields(5)).rowsNumber(1000L));

        final var dataEntityList = new DataEntityList()
            .dataSourceOddrn(createdDataSource.getOddrn())
            .items(List.of(datasetToIngest));

        ingestAndAssert(dataEntityList);
        final long foundEntityId = extractIngestedEntityIdAndAssert(createdDataSource);

        final MetricSetList metricSetList = createMetrics(datasetToIngest.getOddrn(), "metrics/gauge_and_count.json");
        ingestMetrics(metricSetList);

        final org.opendatadiscovery.oddplatform.api.contract.model.MetricSet expectedMetricSet =
            buildExpectedMetricSet(metricSetList.getItems().get(0));
        assertMetrics(foundEntityId, expectedMetricSet, false);

        // Update metrics timestamp to value less than previous
        final MetricSetList updatedMetrics = createMetrics(datasetToIngest.getOddrn(), "metrics/gauge_and_count.json");
        final MetricPoint metricPointToUpdate = updatedMetrics.getItems().get(0).getMetricFamilies().get(0)
            .getMetrics().get(0)
            .getMetricPoints().get(0);
        metricPointToUpdate.setTimestamp(metricPointToUpdate.getTimestamp() - 1000);
        metricPointToUpdate.getGaugeValue().setValue(BigDecimal.ONE);
        ingestMetrics(updatedMetrics);

        // We still expect metrics with previous values
        assertMetrics(foundEntityId, expectedMetricSet, false);

        // Update metrics timestamp to value more than previous
        // this metric point should be updated
        final MetricSetList newMetrics = createMetrics(datasetToIngest.getOddrn(), "metrics/gauge_and_count.json");
        final MetricPoint firstMetricPointToUpdate = newMetrics.getItems().get(0).getMetricFamilies().get(0)
            .getMetrics().get(0)
            .getMetricPoints().get(0);
        firstMetricPointToUpdate.setTimestamp(firstMetricPointToUpdate.getTimestamp() + 100);
        firstMetricPointToUpdate.getGaugeValue().setValue(BigDecimal.ONE);

        // We expect, that metric value is updated
        final org.opendatadiscovery.oddplatform.api.contract.model.MetricSet newExpectedMetricSet =
            buildExpectedMetricSet(newMetrics.getItems().get(0));

        // this metric point shouldn't be updated
        final MetricPoint secondMetricPointToUpdate = newMetrics.getItems().get(0).getMetricFamilies().get(0)
            .getMetrics().get(1)
            .getMetricPoints().get(0);
        secondMetricPointToUpdate.setTimestamp(secondMetricPointToUpdate.getTimestamp() - 100);
        secondMetricPointToUpdate.getGaugeValue().setValue(BigDecimal.ONE);
        ingestMetrics(newMetrics);

        assertMetrics(foundEntityId, newExpectedMetricSet, false);
    }

    @Test
    public void histogramAndSummaryTest() throws IOException {
        final DataSource createdDataSource = createDataSource();

        final DataEntity datasetToIngest = IngestionModelGenerator
            .generateSimpleDataEntity(DataEntityType.TABLE)
            .dataset(new DataSet().fieldList(IngestionModelGenerator.generateDatasetFields(5)).rowsNumber(1000L));

        final var dataEntityList = new DataEntityList()
            .dataSourceOddrn(createdDataSource.getOddrn())
            .items(List.of(datasetToIngest));

        ingestAndAssert(dataEntityList);
        final long foundEntityId = extractIngestedEntityIdAndAssert(createdDataSource);

        final MetricSetList metricSetList = createMetrics(datasetToIngest.getOddrn(),
            "metrics/histogram_and_summary.json");
        ingestMetrics(metricSetList);

        final org.opendatadiscovery.oddplatform.api.contract.model.MetricSet expectedMetricSet =
            buildExpectedMetricSet(metricSetList.getItems().get(0));
        assertMetrics(foundEntityId, expectedMetricSet, false);

        // Update metrics timestamp to value less than previous
        final MetricSetList updatedMetricSet = createMetrics(datasetToIngest.getOddrn(),
            "metrics/histogram_and_summary.json");
        final MetricPoint metricPointToUpdate = updatedMetricSet.getItems().get(0).getMetricFamilies().get(0)
            .getMetrics().get(0).getMetricPoints().get(0);
        metricPointToUpdate.setTimestamp(metricPointToUpdate.getTimestamp() - 1000);
        metricPointToUpdate.getHistogramValue().setBuckets(
            List.of(
                new Bucket().count(5L).upperBound(new BigDecimal(10)),
                new Bucket().count(15L).upperBound(new BigDecimal(20))
            )
        );
        ingestMetrics(updatedMetricSet);

        // We still expect metrics with previous values
        assertMetrics(foundEntityId, expectedMetricSet, false);

        // Update metrics timestamp to value more than previous
        final MetricSetList newUpdatedMetricSet = createMetrics(datasetToIngest.getOddrn(),
            "metrics/histogram_and_summary.json");
        final MetricPoint firstUpdatedMetricPoint = newUpdatedMetricSet.getItems().get(0).getMetricFamilies().get(0)
            .getMetrics().get(0).getMetricPoints().get(0);
        firstUpdatedMetricPoint.setTimestamp(firstUpdatedMetricPoint.getTimestamp() + 100);
        firstUpdatedMetricPoint.getHistogramValue().setCount(null);
        firstUpdatedMetricPoint.getHistogramValue().setBuckets(
            List.of(
                new Bucket().count(35L).upperBound(new BigDecimal(10)),
                new Bucket().count(6L).upperBound(new BigDecimal(30)),
                new Bucket().count(16L).upperBound(new BigDecimal(40))
            )
        );

        final org.opendatadiscovery.oddplatform.api.contract.model.MetricSet newExpectedMetricSet =
            buildExpectedMetricSet(newUpdatedMetricSet.getItems().get(0));

        // This metric point should not be updated, because timestamp is less than previous one
        final MetricPoint secondUpdatedMetricPoint = newUpdatedMetricSet.getItems().get(0).getMetricFamilies().get(0)
            .getMetrics().get(1).getMetricPoints().get(0);
        secondUpdatedMetricPoint.setTimestamp(secondUpdatedMetricPoint.getTimestamp() - 100);
        secondUpdatedMetricPoint.getHistogramValue().setCount(null);
        secondUpdatedMetricPoint.getHistogramValue().setBuckets(
            List.of(
                new Bucket().count(43L).upperBound(new BigDecimal(11)),
                new Bucket().count(55L).upperBound(new BigDecimal(22)),
                new Bucket().count(11L).upperBound(new BigDecimal(44))
            )
        );

        ingestMetrics(newUpdatedMetricSet);

        // We expect, that metric value is updated
        assertMetrics(foundEntityId, newExpectedMetricSet, false);
    }

    private MetricSetList createMetrics(final String oddrn,
                                        final String fileName) throws IOException {
        final MetricSetList metricSetList = new MetricSetList();
        final List<MetricSet> items = new ArrayList<>();
        final MetricSet metricSet =
            objectMapper.readValue(new ClassPathResource(fileName).getInputStream(), MetricSet.class);
        metricSet.setOddrn(oddrn);
        items.add(metricSet);
        metricSetList.setItems(items);
        return metricSetList;
    }
}
