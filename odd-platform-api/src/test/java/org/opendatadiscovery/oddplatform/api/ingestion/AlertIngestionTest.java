package org.opendatadiscovery.oddplatform.api.ingestion;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.apache.commons.collections4.ListUtils;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.BaseIngestionTest;
import org.opendatadiscovery.oddplatform.api.contract.model.Alert;
import org.opendatadiscovery.oddplatform.api.contract.model.AlertList;
import org.opendatadiscovery.oddplatform.api.contract.model.AlertStatus;
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

import static java.util.stream.Collectors.groupingBy;
import static java.util.stream.Collectors.toList;
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

        // Assert that alerts were created as 2 fields were removed from the schema
        assertAlerts(foundEntityId, 1, 2, AlertType.BACKWARDS_INCOMPATIBLE_SCHEMA);
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
        assertNoAlerts(jobId);

        jobRun.getDataTransformerRun().setStatus(JobRunStatus.FAILED);
        ingestAndAssert(dataEntityList);

        assertAlerts(jobId, 1, 1, AlertType.FAILED_JOB);

        jobRun.getDataTransformerRun().setStatus(JobRunStatus.BROKEN);
        ingestAndAssert(dataEntityList);

        assertAlerts(jobId, 1, 2, AlertType.FAILED_JOB);

        jobRun.getDataTransformerRun().setStatus(JobRunStatus.SUCCESS);
        ingestAndAssert(dataEntityList);

        assertAlerts(jobId, 1, 2, AlertType.FAILED_JOB, AlertStatus.RESOLVED_AUTOMATICALLY);
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

        assertNoAlerts(ingestionMap.get(dataset.getOddrn()));
        dataQualityTestRun.getDataQualityTestRun().setStatus(QualityRunStatus.FAILED);
        ingestAndAssert(dataEntityList);
        assertAlerts(ingestionMap.get(dataset.getOddrn()), 1, 1, AlertType.FAILED_DQ_TEST);
    }

    @Test
    @DisplayName("Simple resolve of an alert 'Failed DQ Test'")
    public void simpleAlertResolvingTestForDQ() {
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
                .status(QualityRunStatus.FAILED)
            );

        final var dataEntityList = new DataEntityList()
            .dataSourceOddrn(createdDataSource.getOddrn())
            .items(List.of(dataset, dataQualityTest, dataQualityTestRun));

        ingestAndAssert(dataEntityList);

        final Map<String, Long> ingestionMap = extractIngestedEntitiesAndAssert(createdDataSource, 2);

        assertAlerts(ingestionMap.get(dataset.getOddrn()), 1, 1, AlertType.FAILED_DQ_TEST);

        final DataEntity successDataQualityTestRun = IngestionModelGenerator
            .generateSimpleDataEntity(DataEntityType.JOB_RUN)
            .dataQualityTestRun(new DataQualityTestRun()
                .dataQualityTestOddrn(dataQualityTest.getOddrn())
                .startTime(startTime.plusMinutes(1))
                .endTime(startTime.plusMinutes(2))
                .status(QualityRunStatus.SUCCESS)
            );

        // Injecting only successful DQTR, to assert that Ingestion API will fetch additional data from the database
        ingestAndAssert(new DataEntityList()
            .dataSourceOddrn(createdDataSource.getOddrn())
            .items(List.of(successDataQualityTestRun))
        );

        assertAlerts(ingestionMap.get(dataset.getOddrn()), 1, 1, AlertType.FAILED_DQ_TEST,
            AlertStatus.RESOLVED_AUTOMATICALLY);
    }

    @Test
    @DisplayName("Simple resolve of an alert 'Failed DT Run'")
    public void simpleAlertResolvingTestForDT() {
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
                .status(JobRunStatus.FAILED)
            );

        final var dataEntityList = new DataEntityList()
            .dataSourceOddrn(createdDataSource.getOddrn())
            .items(List.of(job, jobRun));

        ingestAndAssert(dataEntityList);

        final long dtId = extractIngestedEntityIdAndAssert(createdDataSource);

        assertAlerts(dtId, 1, 1, AlertType.FAILED_JOB);

        final DataEntity successfulJobRun = IngestionModelGenerator.generateSimpleDataEntity(DataEntityType.JOB_RUN)
            .dataTransformerRun(new DataTransformerRun()
                .transformerOddrn(job.getOddrn())
                .startTime(jobStartTime.plusMinutes(1))
                .endTime(jobStartTime.plusMinutes(2))
                .status(JobRunStatus.SUCCESS)
            );

        ingestAndAssert(new DataEntityList()
            .dataSourceOddrn(createdDataSource.getOddrn())
            .items(List.of(job, successfulJobRun))
        );

        assertAlerts(dtId, 1, 1, AlertType.FAILED_JOB, AlertStatus.RESOLVED_AUTOMATICALLY);
    }

    @Test
    @DisplayName("Inject resolved alerts with chunks")
    public void injectResolvedAlertWithChunksTest() {
        final DataSource createdDataSource = createDataSource();

        final DataEntity dataset = IngestionModelGenerator
            .generateSimpleDataEntity(DataEntityType.TABLE)
            .dataset(new DataSet().rowsNumber(1_000L).fieldList(IngestionModelGenerator.generateDatasetFields(5)));

        final OffsetDateTime jobStartTime = OffsetDateTime
            .of(LocalDateTime.now(), ZoneOffset.UTC)
            .truncatedTo(ChronoUnit.MILLIS);

        final DataEntity dataQualityTest = IngestionModelGenerator.generateSimpleDataEntity(DataEntityType.JOB)
            .dataQualityTest(new DataQualityTest()
                .datasetList(List.of(dataset.getOddrn()))
                .suiteName(UUID.randomUUID().toString())
                .expectation(new DataQualityTestExpectation().type(UUID.randomUUID().toString()))
            );

        final DataEntity dataQualityTestRun1 = IngestionModelGenerator.generateSimpleDataEntity(DataEntityType.JOB_RUN)
            .dataQualityTestRun(new DataQualityTestRun()
                .dataQualityTestOddrn(dataQualityTest.getOddrn())
                .startTime(jobStartTime)
                .endTime(jobStartTime.plusMinutes(1))
                .status(QualityRunStatus.FAILED)
            );

        final DataEntity dataQualityTestRun2 = IngestionModelGenerator.generateSimpleDataEntity(DataEntityType.JOB_RUN)
            .dataQualityTestRun(new DataQualityTestRun()
                .dataQualityTestOddrn(dataQualityTest.getOddrn())
                .startTime(jobStartTime)
                .endTime(jobStartTime.plusMinutes(2))
                .status(QualityRunStatus.SUCCESS)
            );

        final DataEntity dataQualityTestRun3 = IngestionModelGenerator.generateSimpleDataEntity(DataEntityType.JOB_RUN)
            .dataQualityTestRun(new DataQualityTestRun()
                .dataQualityTestOddrn(dataQualityTest.getOddrn())
                .startTime(jobStartTime)
                .endTime(jobStartTime.plusMinutes(3))
                .status(QualityRunStatus.FAILED)
            );

        final DataEntity dataQualityTestRun4 = IngestionModelGenerator.generateSimpleDataEntity(DataEntityType.JOB_RUN)
            .dataQualityTestRun(new DataQualityTestRun()
                .dataQualityTestOddrn(dataQualityTest.getOddrn())
                .startTime(jobStartTime)
                .endTime(jobStartTime.plusMinutes(4))
                .status(QualityRunStatus.FAILED)
            );

        final DataEntity dataQualityTestRun5 = IngestionModelGenerator.generateSimpleDataEntity(DataEntityType.JOB_RUN)
            .dataQualityTestRun(new DataQualityTestRun()
                .dataQualityTestOddrn(dataQualityTest.getOddrn())
                .startTime(jobStartTime)
                .endTime(jobStartTime.plusMinutes(5))
                .status(QualityRunStatus.SUCCESS)
            );

        final var dataEntityList = new DataEntityList()
            .dataSourceOddrn(createdDataSource.getOddrn())
            .items(List.of(dataset, dataQualityTest, dataQualityTestRun1, dataQualityTestRun2, dataQualityTestRun3,
                dataQualityTestRun4, dataQualityTestRun5));

        ingestAndAssert(dataEntityList);

        final long datasetId = extractIngestedEntitiesAndAssert(createdDataSource, 2).get(dataset.getOddrn());

        webTestClient.get()
            .uri("/api/dataentities/{data_entity_id}/alerts?page=1&size=1000", datasetId)
            .exchange()
            .expectStatus().isOk()
            .expectBody(AlertList.class)
            .value(actual -> {
                assertThat(actual.getItems()).hasSize(2);
                final List<Alert> alerts = actual.getItems()
                    .stream()
                    .sorted(Comparator.comparing(a -> a.getAlertChunkList().size()))
                    .toList();

                final Alert firstAlert = alerts.get(0);
                final Alert secondAlert = alerts.get(1);

                assertThat(firstAlert.getAlertChunkList().size()).isEqualTo(1);
                assertThat(secondAlert.getAlertChunkList().size()).isEqualTo(2);

                assertThat(firstAlert.getStatus()).isEqualTo(AlertStatus.RESOLVED_AUTOMATICALLY);
                assertThat(secondAlert.getStatus()).isEqualTo(AlertStatus.RESOLVED_AUTOMATICALLY);
            });
    }

    @Test
    @DisplayName("Complex scenario for alert ingestion")
    public void complexScenarioForAlertIngestion() {
        final DataSource createdDataSource = createDataSource();
        final List<String> inputs = List.of("input1", "input2");
        final List<String> outputs = List.of("output1", "output2");

        final DataEntity view = IngestionModelGenerator
            .generateSimpleDataEntity(DataEntityType.VIEW)
            .dataTransformer(new DataTransformer().inputs(inputs).outputs(outputs))
            .dataset(new DataSet().rowsNumber(1_000L).fieldList(IngestionModelGenerator.generateDatasetFields(5)));

        final OffsetDateTime jobStartTime = OffsetDateTime
            .of(LocalDateTime.now(), ZoneOffset.UTC)
            .truncatedTo(ChronoUnit.MILLIS);

        final DataEntity dataQualityTest1 = IngestionModelGenerator.generateSimpleDataEntity(DataEntityType.JOB)
            .dataQualityTest(new DataQualityTest()
                .datasetList(List.of(view.getOddrn()))
                .suiteName(UUID.randomUUID().toString())
                .expectation(new DataQualityTestExpectation().type(UUID.randomUUID().toString()))
            );

        final DataEntity dataQualityTestRun1 = IngestionModelGenerator.generateSimpleDataEntity(DataEntityType.JOB_RUN)
            .dataQualityTestRun(new DataQualityTestRun()
                .dataQualityTestOddrn(dataQualityTest1.getOddrn())
                .startTime(jobStartTime)
                .endTime(jobStartTime.plusMinutes(1))
                .status(QualityRunStatus.FAILED)
            );

        final DataEntity dataQualityTest2 = IngestionModelGenerator.generateSimpleDataEntity(DataEntityType.JOB)
            .dataQualityTest(new DataQualityTest()
                .datasetList(List.of(view.getOddrn()))
                .suiteName(UUID.randomUUID().toString())
                .expectation(new DataQualityTestExpectation().type(UUID.randomUUID().toString()))
            );

        final DataEntity dataQualityTestRun2 = IngestionModelGenerator.generateSimpleDataEntity(DataEntityType.JOB_RUN)
            .dataQualityTestRun(new DataQualityTestRun()
                .dataQualityTestOddrn(dataQualityTest2.getOddrn())
                .startTime(jobStartTime)
                .endTime(jobStartTime.plusMinutes(1))
                .status(QualityRunStatus.FAILED)
            );

        final DataEntity jobRun = IngestionModelGenerator.generateSimpleDataEntity(DataEntityType.JOB_RUN)
            .dataTransformerRun(new DataTransformerRun()
                .transformerOddrn(view.getOddrn())
                .startTime(jobStartTime)
                .endTime(jobStartTime.plusMinutes(1))
                .status(JobRunStatus.SUCCESS)
            );

        final var dataEntityList = new DataEntityList()
            .dataSourceOddrn(createdDataSource.getOddrn())
            .items(List.of(view, dataQualityTest1, dataQualityTestRun1, dataQualityTest2, dataQualityTestRun2, jobRun));

        ingestAndAssert(dataEntityList);

        final long viewId = extractIngestedEntitiesAndAssert(createdDataSource, 3).get(view.getOddrn());

        assertAlerts(viewId, 2, 1, AlertType.FAILED_DQ_TEST);

        // triggering every alert that can be in a context of this entity
        view.getDataTransformer().setInputs(List.of("input3"));
        view.getDataTransformer().setOutputs(List.of("output3"));
        view.getDataset().setFieldList(
            ListUtils.union(
                view.getDataset().getFieldList().subList(0, 3),
                IngestionModelGenerator.generateDatasetFields(2)
            )
        );

        jobRun.setOddrn(UUID.randomUUID().toString());
        jobRun.getDataTransformerRun().setStatus(JobRunStatus.FAILED);
        dataQualityTest2.setOddrn(UUID.randomUUID().toString());
        dataQualityTestRun2.getDataQualityTestRun().setStatus(QualityRunStatus.SUCCESS);

        ingestAndAssert(dataEntityList);

        webTestClient.get()
            .uri("/api/dataentities/{data_entity_id}/alerts?page=1&size=1000", viewId)
            .exchange()
            .expectStatus().isOk()
            .expectBody(AlertList.class)
            .value(actual -> {
                final Map<AlertType, List<Alert>> actualAlertMap =
                    actual.getItems().stream().collect(groupingBy(Alert::getType, toList()));

                assertThat(actualAlertMap.size()).isEqualTo(3);

                final List<Alert> jobAlerts = actualAlertMap.get(AlertType.FAILED_JOB);
                assertThat(jobAlerts).hasSize(1);
                assertThat(jobAlerts.get(0).getStatus()).isEqualTo(AlertStatus.OPEN);
                assertThat(jobAlerts.get(0).getAlertChunkList()).hasSize(1);

                final List<Alert> bisAlerts = actualAlertMap.get(AlertType.BACKWARDS_INCOMPATIBLE_SCHEMA);
                assertThat(bisAlerts).hasSize(1);
                assertThat(bisAlerts.get(0).getStatus()).isEqualTo(AlertStatus.OPEN);
                // missing input1 + input2 + output1 + output2 + (2 fields from dataset schema) = 6
                assertThat(bisAlerts.get(0).getAlertChunkList()).hasSize(6);

                final List<Alert> dqAlerts = new ArrayList<>(actualAlertMap.get(AlertType.FAILED_DQ_TEST));
                assertThat(dqAlerts).hasSize(2);
                dqAlerts.sort(Comparator.comparing(a -> a.getStatus().toString()));
                assertThat(dqAlerts.get(0).getStatus()).isEqualTo(AlertStatus.OPEN);
                assertThat(dqAlerts.get(0).getAlertChunkList()).hasSize(2);

                assertThat(dqAlerts.get(1).getStatus()).isEqualTo(AlertStatus.RESOLVED_AUTOMATICALLY);
                assertThat(dqAlerts.get(1).getAlertChunkList()).hasSize(1);
            });
    }

    @Test
    @DisplayName("Create new Failed DQ Test alert with existing open alerts")
    public void createNewFailedDQTestAlert() {
        final DataSource createdDataSource = createDataSource();

        final DataEntity dataset = IngestionModelGenerator
            .generateSimpleDataEntity(DataEntityType.VIEW)
            .dataset(new DataSet().rowsNumber(1_000L).fieldList(IngestionModelGenerator.generateDatasetFields(5)));

        final OffsetDateTime jobStartTime = OffsetDateTime
            .of(LocalDateTime.now(), ZoneOffset.UTC)
            .truncatedTo(ChronoUnit.MILLIS);

        final DataEntity dataQualityTest1 = IngestionModelGenerator.generateSimpleDataEntity(DataEntityType.JOB)
            .dataQualityTest(new DataQualityTest()
                .datasetList(List.of(dataset.getOddrn()))
                .suiteName(UUID.randomUUID().toString())
                .expectation(new DataQualityTestExpectation().type(UUID.randomUUID().toString()))
            );

        final DataEntity dataQualityTestRun1 = IngestionModelGenerator.generateSimpleDataEntity(DataEntityType.JOB_RUN)
            .dataQualityTestRun(new DataQualityTestRun()
                .dataQualityTestOddrn(dataQualityTest1.getOddrn())
                .startTime(jobStartTime)
                .endTime(jobStartTime.plusMinutes(1))
                .status(QualityRunStatus.FAILED)
            );

        final DataEntity dataQualityTest2 = IngestionModelGenerator.generateSimpleDataEntity(DataEntityType.JOB)
            .dataQualityTest(new DataQualityTest()
                .datasetList(List.of(dataset.getOddrn()))
                .suiteName(UUID.randomUUID().toString())
                .expectation(new DataQualityTestExpectation().type(UUID.randomUUID().toString()))
            );

        final DataEntity dataQualityTestRun2 = IngestionModelGenerator.generateSimpleDataEntity(DataEntityType.JOB_RUN)
            .dataQualityTestRun(new DataQualityTestRun()
                .dataQualityTestOddrn(dataQualityTest2.getOddrn())
                .startTime(jobStartTime)
                .endTime(jobStartTime.plusMinutes(1))
                .status(QualityRunStatus.FAILED)
            );

        final var dataEntityList = new DataEntityList()
            .dataSourceOddrn(createdDataSource.getOddrn())
            .items(List.of(dataset, dataQualityTest1, dataQualityTestRun1, dataQualityTest2, dataQualityTestRun2));

        ingestAndAssert(dataEntityList);

        final long datasetId = extractIngestedEntitiesAndAssert(createdDataSource, 3).get(dataset.getOddrn());

        assertAlerts(datasetId, 2, 1, AlertType.FAILED_DQ_TEST);

        final DataEntity dataQualityTest3 = IngestionModelGenerator.generateSimpleDataEntity(DataEntityType.JOB)
            .dataQualityTest(new DataQualityTest()
                .datasetList(List.of(dataset.getOddrn()))
                .suiteName(UUID.randomUUID().toString())
                .expectation(new DataQualityTestExpectation().type(UUID.randomUUID().toString()))
            );

        final DataEntity dataQualityTestRun3 = IngestionModelGenerator.generateSimpleDataEntity(DataEntityType.JOB_RUN)
            .dataQualityTestRun(new DataQualityTestRun()
                .dataQualityTestOddrn(dataQualityTest3.getOddrn())
                .startTime(jobStartTime)
                .endTime(jobStartTime.plusMinutes(1))
                .status(QualityRunStatus.FAILED)
            );

        final var secondDataEntityList = new DataEntityList()
            .dataSourceOddrn(createdDataSource.getOddrn())
            .items(List.of(dataQualityTest3, dataQualityTestRun3));

        ingestAndAssert(secondDataEntityList);

        assertAlerts(datasetId, 3, 1, AlertType.FAILED_DQ_TEST);
    }

    private void assertNoAlerts(final long dataEntityId) {
        webTestClient.get()
            .uri("/api/dataentities/{data_entity_id}/alerts?page=1&size=1000", dataEntityId)
            .exchange()
            .expectStatus().isOk()
            .expectBody(AlertList.class)
            .value(actual -> assertThat(actual.getItems()).isEmpty());
    }

    private void assertAlerts(final long dataEntityId,
                              final int expectedAlertsCount,
                              final int expectedChunksCount,
                              final AlertType expectedAlertType) {
        assertAlerts(dataEntityId, expectedAlertsCount, expectedChunksCount, expectedAlertType, AlertStatus.OPEN);
    }

    private void assertAlerts(final long dataEntityId,
                              final int expectedAlertsCount,
                              final int expectedChunksCount,
                              final AlertType expectedAlertType,
                              final AlertStatus expectedAlertStatus) {
        webTestClient.get()
            .uri("/api/dataentities/{data_entity_id}/alerts?page=1&size=1000", dataEntityId)
            .exchange()
            .expectStatus().isOk()
            .expectBody(AlertList.class)
            .value(actual -> {
                assertThat(actual.getItems()).hasSize(expectedAlertsCount);
                actual.getItems().forEach(alert -> {
                    assertThat(alert.getType()).isEqualTo(expectedAlertType);
                    assertThat(alert.getStatus()).isEqualTo(expectedAlertStatus);
                    assertThat(alert.getAlertChunkList()).hasSize(expectedChunksCount);
                });
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