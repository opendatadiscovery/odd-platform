package org.opendatadiscovery.oddplatform.api.ingestion;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.apache.commons.collections4.ListUtils;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.BaseIngestionTest;
import org.opendatadiscovery.oddplatform.api.contract.model.AlertList;
import org.opendatadiscovery.oddplatform.api.contract.model.AlertType;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityDetails;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityRef;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityRun;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityRunStatus;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSetStats;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSource;
import org.opendatadiscovery.oddplatform.api.ingestion.utils.IngestionModelGenerator;
import org.opendatadiscovery.oddplatform.api.ingestion.utils.IngestionModelMapper;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataEntity;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataEntityList;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataEntityType;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataQualityTest;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataQualityTestExpectation;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataQualityTestRun;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataSet;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataTransformer;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataTransformerRun;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.JobRunStatus;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.QualityRunStatus;

import static org.assertj.core.api.Assertions.assertThat;

public class AlertIngestionTest extends BaseIngestionTest {

    /**
     * Backwards incompatible schema change alert test.
     *
     * <p>Ingests a dataset and then changes its schema in a backwards incompatible way so that alert would trigger
     * and asserts the existence of the alert
     */
    @Test
    @DisplayName("Backwards incompatible schema change alert test")
    public void backwardsIncompatibleAlertIngestionTest() {
        final DataSource createdDataSource = createDataSource();

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

        assertDataEntityDetailsEqual(expectedDataEntityDetails, (expected, actual) -> {
            assertThat(actual.getVersionList()).hasSize(1);
            assertThat(actual.getVersionList().get(0).getVersion()).isEqualTo(1);
        });

        // Ingest new schema that lacks 2 fields from the previous one
        final var newFields = ListUtils.union(
            datasetToIngest.getDataset().getFieldList().subList(0, 3),
            IngestionModelGenerator.generateDatasetFields(2)
        );

        datasetToIngest.getDataset().setFieldList(newFields);

        ingestAndAssert(dataEntityList);

        final var updatedExpectedDataEntityDetails = IngestionModelMapper
            .buildExpectedBaseDEDetails(foundEntityId, datasetToIngest, createdDataSource)
            .stats(new DataSetStats()
                .consumersCount(0L)
                .fieldsCount((long) datasetToIngest.getDataset().getFieldList().size())
                .rowsCount(datasetToIngest.getDataset().getRowsNumber()));

        assertDataEntityDetailsEqual(updatedExpectedDataEntityDetails, (expected, actual) -> {
            assertThat(actual.getVersionList()).hasSize(2);
            assertThat(actual.getVersionList().get(0).getVersion()).isEqualTo(1);
            assertThat(actual.getVersionList().get(1).getVersion()).isEqualTo(2);
        });

        // Assert that two alerts were created as 2 fields were removed from the schema

        assertAlerts(foundEntityId, 2, AlertType.BACKWARDS_INCOMPATIBLE_SCHEMA);
    }

    /**
     * Failed job alert ingestion test
     *
     * <p>Ingests a data transformer with successful data transformer run.
     * Then ingests the same data transformer with the same data transformer run but with failed status.
     * Asserts that the alert of type JOB_FAILED was created
     */
    @Test
    @DisplayName("Failed job alert test")
    public void failedJobAlertIngestionTest() {
        final DataSource createdDataSource = createDataSource();

        final DataEntity job = IngestionModelGenerator
            .generateSimpleDataEntity(DataEntityType.JOB)
            .dataTransformer(new DataTransformer());

        final OffsetDateTime jobStartTime = OffsetDateTime
            .of(LocalDateTime.now(), ZoneOffset.UTC)
            .truncatedTo(ChronoUnit.MILLIS);

        final DataEntity jobRun = IngestionModelGenerator.generateSimpleDataEntity(DataEntityType.JOB_RUN)
            .dataTransformerRun(new DataTransformerRun()
                .transformerOddrn(job.getOddrn())
                .startTime(jobStartTime)
                .endTime(jobStartTime.plusMinutes(1))
                .status(JobRunStatus.SUCCESS)
            );

        final var dataEntityList = new DataEntityList()
            .dataSourceOddrn(createdDataSource.getOddrn())
            .items(List.of(job, jobRun));

        ingestAndAssert(dataEntityList);

        // Data transformer run isn't a data entity in the ODD Platform, so we need to extract an id of a job only
        final long jobId = extractIngestedEntityIdAndAssert(createdDataSource);

        final DataEntityDetails expectedDataEntityDetails =
            IngestionModelMapper.buildExpectedBaseDEDetails(jobId, job, createdDataSource);

        assertDataEntityDetailsEqual(expectedDataEntityDetails, (expected, actual) -> {
            assertThat(actual.getSourceList()).isEmpty();
            assertThat(actual.getTargetList()).isEmpty();
        });

        // no alerts are expected as the job is successful
        assertAlerts(jobId, 0, AlertType.FAILED_JOB);

        jobRun.getDataTransformerRun().setStatus(JobRunStatus.FAILED);
        ingestAndAssert(dataEntityList);

        assertAlerts(jobId, 1, AlertType.FAILED_JOB);

        jobRun.getDataTransformerRun().setStatus(JobRunStatus.BROKEN);
        ingestAndAssert(dataEntityList);

        assertAlerts(jobId, 2, AlertType.FAILED_JOB);

        jobRun.getDataTransformerRun().setStatus(JobRunStatus.SUCCESS);
        ingestAndAssert(dataEntityList);

        assertAlerts(jobId, 2, AlertType.FAILED_JOB);
    }

    @Test
    @DisplayName("Failed DQ test alert ingestion test")
    public void failedDQTestAlertIngestionTest() {
        final DataSource createdDataSource = createDataSource();

        final DataEntity dataset = IngestionModelGenerator
            .generateSimpleDataEntity(DataEntityType.TABLE)
            .dataset(new DataSet().rowsNumber(1_000L).fieldList(IngestionModelGenerator.generateDatasetFields(5)));

        final DataEntity dataQualityTest = IngestionModelGenerator.generateSimpleDataEntity(DataEntityType.JOB)
            .dataQualityTest(new DataQualityTest()
                .datasetList(List.of(dataset.getOddrn()))
                .suiteName(UUID.randomUUID().toString())
                .expectation(new DataQualityTestExpectation().type(UUID.randomUUID().toString()))
            );

        final OffsetDateTime startTime = OffsetDateTime
            .of(LocalDateTime.now(), ZoneOffset.UTC)
            .truncatedTo(ChronoUnit.MILLIS);

        final DataEntity dataQualityTestRun = IngestionModelGenerator.generateSimpleDataEntity(DataEntityType.JOB_RUN)
            .dataQualityTestRun(new DataQualityTestRun()
                .dataQualityTestOddrn(dataQualityTest.getOddrn())
                .startTime(startTime)
                .endTime(startTime.plusMinutes(1))
                .status(QualityRunStatus.SUCCESS)
            );

        final var dataEntityList = new DataEntityList()
            .dataSourceOddrn(createdDataSource.getOddrn())
            .items(List.of(dataset, dataQualityTest, dataQualityTestRun));

        ingestAndAssert(dataEntityList);

        final Map<String, Long> ingestionMap = extractIngestedEntitiesAndAssert(createdDataSource, 2);

        Map.of(dataset.getOddrn(), dataset, dataQualityTest.getOddrn(), dataQualityTest)
            .forEach((expectedOddrn, dataEntity) -> {
                final long entityId = ingestionMap.get(expectedOddrn);
                final DataEntityDetails expectedDetails =
                    IngestionModelMapper.buildExpectedBaseDEDetails(entityId, dataEntity, createdDataSource);

                if (dataEntity.getDataset() != null) {
                    expectedDetails.setStats(new DataSetStats()
                        .consumersCount(0L)
                        .fieldsCount((long) dataEntity.getDataset().getFieldList().size())
                        .rowsCount(dataEntity.getDataset().getRowsNumber()));

                    assertDataEntityDetailsEqual(expectedDetails, (expected, actual) -> {
                        assertThat(actual.getVersionList()).hasSize(1);
                        assertThat(actual.getVersionList().get(0).getVersion()).isEqualTo(1);
                    });
                }

                if (dataEntity.getDataQualityTest() != null) {
                    final List<DataEntityRef> datasetsList =
                        List.of(buildExpectedDataEntityRef(dataset, ingestionMap.get(dataset.getOddrn())));

                    expectedDetails.setExpectation(
                        new org.opendatadiscovery.oddplatform.api.contract.model.DataQualityTestExpectation().type(
                            dataEntity.getDataQualityTest().getExpectation().getType()));

                    expectedDetails.setSuiteName(dataEntity.getDataQualityTest().getSuiteName());

                    expectedDetails.setLatestRun(
                        buildExpectedDataEntityRun(ingestionMap.get(dataQualityTest.getOddrn()), dataQualityTestRun));

                    assertDataEntityDetailsEqual(expectedDetails, (expected, actual) ->
                        assertThat(actual.getDatasetsList())
                            .usingRecursiveFieldByFieldElementComparatorIgnoringFields("entityClasses")
                            .hasSameElementsAs(datasetsList)
                    );
                }
            });

        assertAlerts(ingestionMap.get(dataset.getOddrn()), 0, AlertType.FAILED_DQ_TEST);
        dataQualityTestRun.getDataQualityTestRun().setStatus(QualityRunStatus.FAILED);
        ingestAndAssert(dataEntityList);
        assertAlerts(ingestionMap.get(dataset.getOddrn()), 1, AlertType.FAILED_DQ_TEST);
    }

    private void assertAlerts(final long dataEntityId,
                              final int expectedAlertsCount,
                              final AlertType expectedAlertType) {
        webTestClient.get()
            .uri("/api/dataentities/{data_entity_id}/alerts", dataEntityId)
            .exchange()
            .expectStatus().isOk()
            .expectBody(AlertList.class)
            .value(actual -> {
                assertThat(actual.getItems()).hasSize(expectedAlertsCount);
                actual.getItems().forEach(alert -> assertThat(alert.getType()).isEqualTo(expectedAlertType));
            });
    }

    private DataEntityRun buildExpectedDataEntityRun(final long dataQualityTestId,
                                                     final DataEntity dataQualityTestRun) {
        return new DataEntityRun()
            .oddrn(dataQualityTestRun.getOddrn())
            .name(dataQualityTestRun.getName())
            .createdAt(dataQualityTestRun.getCreatedAt())
            .dataEntityId(dataQualityTestId)
            .startTime(dataQualityTestRun.getDataQualityTestRun().getStartTime())
            .endTime(dataQualityTestRun.getDataQualityTestRun().getEndTime())
            .statusReason(dataQualityTestRun.getDataQualityTestRun().getStatusReason())
            .status(DataEntityRunStatus.fromValue(
                dataQualityTestRun.getDataQualityTestRun().getStatus().name()));
    }
}