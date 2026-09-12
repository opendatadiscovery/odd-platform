package org.opendatadiscovery.oddplatform.api.ingestion;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.BaseIngestionTest;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSource;
import org.opendatadiscovery.oddplatform.api.ingestion.utils.IngestionModelGenerator;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataEntity;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataEntityList;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataEntityType;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataSet;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.MetricSet;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.MetricSetList;
import org.springframework.core.io.ClassPathResource;
import org.testcontainers.shaded.com.fasterxml.jackson.databind.ObjectMapper;

/**
 * Regression test for a metric family with a non-null {@code help} (description)
 * being ingested twice: {@link org.opendatadiscovery.oddplatform.repository.metric
 * .MetricFamilyRepositoryImpl#createOrUpdateMetricFamilies} used to build its
 * upsert as {@code ON CONFLICT DO UPDATE ... WHERE description IS NULL RETURNING *},
 * and Postgres skips both the update and RETURNING for a conflicting row whenever
 * that WHERE clause does not hold -- which it never does once a description has
 * been stored once. The second ingest of the same family then produced a
 * {@code Map<String, MetricFamilyPojo>} missing that family's entry, and a later
 * {@code MetricFamilyPojo::getId} on the resulting null threw the NPE this
 * reproduces without.
 *
 * <p>{@code gauge_and_count.json}, which the sibling {@link MetricsIngestionTest}
 * already re-ingests, never exercises this: it sets no {@code help}, so the
 * WHERE clause it used to depend on stayed true (still null) on every re-ingest.
 */
public class MetricFamilyReingestionTest extends BaseIngestionTest {
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    public void reingestingAFamilyWithADescriptionDoesNotFail() throws IOException {
        final DataSource createdDataSource = createDataSource();

        final DataEntity datasetToIngest = IngestionModelGenerator
            .generateSimpleDataEntity(DataEntityType.TABLE)
            .dataset(new DataSet().fieldList(IngestionModelGenerator.generateDatasetFields(5)).rowsNumber(1000L));

        final var dataEntityList = new DataEntityList()
            .dataSourceOddrn(createdDataSource.getOddrn())
            .items(List.of(datasetToIngest));

        ingestAndAssert(dataEntityList);
        extractIngestedEntityIdAndAssert(createdDataSource);

        final MetricSetList metricSetList = createMetrics(datasetToIngest.getOddrn(), "metrics/gauge_with_help.json");
        // First push creates the family and stores its description. Before the
        // fix, this second push -- same name, type, unit and description -- 500s.
        ingestMetrics(metricSetList);
        ingestMetrics(createMetrics(datasetToIngest.getOddrn(), "metrics/gauge_with_help.json"));
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
