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
import org.springframework.boot.test.util.TestPropertyValues;
import org.springframework.context.ApplicationContextInitializer;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.core.io.ClassPathResource;
import org.springframework.test.context.ContextConfiguration;
import org.testcontainers.containers.BindMode;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.shaded.com.fasterxml.jackson.databind.ObjectMapper;
import org.testcontainers.utility.DockerImageName;

import static org.opendatadiscovery.oddplatform.api.ingestion.utils.IngestionMetricModelMapper.buildExpectedMetricSet;

@ContextConfiguration(initializers = {PrometheusMetricsIngestionTest.Initializer.class})
public class PrometheusMetricsIngestionTest extends BaseIngestionTest {
    private final ObjectMapper objectMapper = new ObjectMapper();

    static final GenericContainer<?> PROMETHEUS_CONTAINER;

    static {
        PROMETHEUS_CONTAINER = new GenericContainer<>(DockerImageName.parse("prom/prometheus:v2.42.0"))
            .withCommand("--config.file=/etc/prometheus/prometheus.yml", "--web.enable-remote-write-receiver")
            .withClasspathResourceMapping("prometheus/prometheus.yml", "/etc/prometheus/prometheus.yml",
                BindMode.READ_WRITE)
            .withExposedPorts(9090);
        PROMETHEUS_CONTAINER.start();
    }

    static class Initializer implements ApplicationContextInitializer<ConfigurableApplicationContext> {

        public void initialize(final ConfigurableApplicationContext configurableApplicationContext) {
            TestPropertyValues.of(
                "metrics.storage=PROMETHEUS",
                "metrics.prometheus-host=http://" + PROMETHEUS_CONTAINER.getHost() + ":"
                    + PROMETHEUS_CONTAINER.getMappedPort(9090)
            ).applyTo(configurableApplicationContext.getEnvironment());
        }
    }

    @Test
    public void testGaugeAndCount() throws IOException {
        final DataSource createdDataSource = createDataSource();

        final DataEntity datasetToIngest = IngestionModelGenerator
            .generateSimpleDataEntity(DataEntityType.TABLE)
            .dataset(new DataSet().fieldList(IngestionModelGenerator.generateDatasetFields(5)).rowsNumber(1000L));

        final var dataEntityList = new DataEntityList()
            .dataSourceOddrn(createdDataSource.getOddrn())
            .items(List.of(datasetToIngest));

        ingestAndAssert(dataEntityList);
        final long foundEntityId = extractIngestedEntityIdAndAssert(createdDataSource);

        final MetricSetList metricSetList =
            createMetrics(datasetToIngest.getOddrn(), "metrics/prometheus/gauge_and_count.json");
        ingestMetrics(metricSetList);

        final org.opendatadiscovery.oddplatform.api.contract.model.MetricSet expectedMetricSet =
            buildExpectedMetricSet(metricSetList.getItems().get(0));
        assertMetrics(foundEntityId, expectedMetricSet, true);

        final MetricSetList newSetList =
            createMetrics(datasetToIngest.getOddrn(), "metrics/prometheus/gauge_and_count.json");
        final MetricPoint newMetricPoint =
            newSetList.getItems().get(0).getMetricFamilies().get(0).getMetrics().get(0).getMetricPoints().get(0);
        newMetricPoint.getGaugeValue().setValue(new BigDecimal(300));
        ingestMetrics(newSetList);

        // We expect, that metric value is updated
        final org.opendatadiscovery.oddplatform.api.contract.model.MetricSet newExpectedMetricSet =
            buildExpectedMetricSet(newSetList.getItems().get(0));
        assertMetrics(foundEntityId, newExpectedMetricSet, true);
    }

    @Test
    public void testHistogramAndSummary() throws IOException {
        final DataSource createdDataSource = createDataSource();

        final DataEntity datasetToIngest = IngestionModelGenerator
            .generateSimpleDataEntity(DataEntityType.TABLE)
            .dataset(new DataSet().fieldList(IngestionModelGenerator.generateDatasetFields(5)).rowsNumber(1000L));

        final var dataEntityList = new DataEntityList()
            .dataSourceOddrn(createdDataSource.getOddrn())
            .items(List.of(datasetToIngest));

        ingestAndAssert(dataEntityList);
        final long foundEntityId = extractIngestedEntityIdAndAssert(createdDataSource);

        final MetricSetList metricSetList =
            createMetrics(datasetToIngest.getOddrn(), "metrics/prometheus/histogram_and_summary.json");
        ingestMetrics(metricSetList);

        final org.opendatadiscovery.oddplatform.api.contract.model.MetricSet expectedMetricSet =
            buildExpectedMetricSet(metricSetList.getItems().get(0));
        assertMetrics(foundEntityId, expectedMetricSet, true);

        final MetricSetList newSetList =
            createMetrics(datasetToIngest.getOddrn(), "metrics/prometheus/histogram_and_summary.json");
        final MetricPoint newMetricPoint =
            newSetList.getItems().get(0).getMetricFamilies().get(0).getMetrics().get(0).getMetricPoints().get(0);
        newMetricPoint.getHistogramValue().setCount(null);
        newMetricPoint.getHistogramValue().setBuckets(
            List.of(
                new Bucket().count(5L).upperBound(new BigDecimal(10)),
                new Bucket().count(15L).upperBound(new BigDecimal(20))
            )
        );

        ingestMetrics(newSetList);

        // We expect, that metric value is updated
        final org.opendatadiscovery.oddplatform.api.contract.model.MetricSet newExpectedMetricSet =
            buildExpectedMetricSet(newSetList.getItems().get(0));
        assertMetrics(foundEntityId, newExpectedMetricSet, true);
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
