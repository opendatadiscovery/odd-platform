package org.opendatadiscovery.oddplatform.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.IntStream;
import org.jooq.JSONB;
import org.jooq.impl.DSL;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.opendatadiscovery.oddplatform.BaseIntegrationTest;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityRunStatus;
import org.opendatadiscovery.oddplatform.api.contract.model.DataQualityCategoryResults;
import org.opendatadiscovery.oddplatform.api.contract.model.TablesDashboard;
import org.opendatadiscovery.oddplatform.dto.DataEntityTypeDto;
import org.opendatadiscovery.oddplatform.dto.DataQualityCategory;
import org.opendatadiscovery.oddplatform.dto.DataQualityTestFiltersDto;
import org.opendatadiscovery.oddplatform.mapper.DataQualityCategoryMapper;
import org.opendatadiscovery.oddplatform.mapper.TablesDashboardMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityTaskLastRunPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityTaskRunPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataQualityTestRelationsPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataEntityRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataEntityTaskRunRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataQualityRunsRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataQualityTestRelationRepository;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.opendatadiscovery.oddplatform.utils.Pair;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.TestExecutionListeners;
import org.springframework.test.context.support.DependencyInjectionTestExecutionListener;
import reactor.test.StepVerifier;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_ENTITY_TASK_LAST_RUN;

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@TestExecutionListeners(listeners = {DependencyInjectionTestExecutionListener.class})
public class ReactiveDataQualityRunsRepositoryTest extends BaseIntegrationTest {
    public static final String DATA_QUALITY_TEST_ATTRIBUTE = """
        {
          "DATA_QUALITY_TEST": {
            "expectation": {
              "category": "{type}"
            }
          }
        }""";
    public static final int NUMBER_OF_ASSERTION = 5;
    public static final int NUMBER_OF_SCHEMA_CHANGES = 3;
    public static final int NUMBER_OF_COLUMN_ANOMALY = 2;
    public static final int NUMBER_OF_FRESHNESS_ANOMALY = 4;
    public static final int NUMBER_OF_VOLUME_ANOMALY = 1;

    public static final Map<DataQualityCategory, Pair<List<DataEntityRunStatus>, Integer>> EXPECTED_VALUES = Map.of(
        DataQualityCategory.ASSERTION, Pair.of(List.of(DataEntityRunStatus.SUCCESS), NUMBER_OF_ASSERTION),
        DataQualityCategory.SCHEMA_CHANGE,
        Pair.of(List.of(DataEntityRunStatus.SUCCESS, DataEntityRunStatus.ABORTED), NUMBER_OF_SCHEMA_CHANGES),
        DataQualityCategory.COLUMN_VALUES_ANOMALY,
        Pair.of(List.of(DataEntityRunStatus.SUCCESS,
            DataEntityRunStatus.FAILED), NUMBER_OF_COLUMN_ANOMALY),
        DataQualityCategory.FRESHNESS_ANOMALY,
        Pair.of(List.of(DataEntityRunStatus.SKIPPED,
            DataEntityRunStatus.ABORTED), NUMBER_OF_FRESHNESS_ANOMALY),
        DataQualityCategory.VOLUME_ANOMALY,
        Pair.of(List.of(DataEntityRunStatus.SKIPPED, DataEntityRunStatus.FAILED), NUMBER_OF_VOLUME_ANOMALY)
    );
    @Autowired
    private ReactiveDataQualityRunsRepository repository;
    @Autowired
    private ReactiveDataEntityTaskRunRepository dataEntityTaskRunRepository;
    @Autowired
    private ReactiveDataEntityRepository dataEntityRepository;
    @Autowired
    private ReactiveDataQualityTestRelationRepository dataQualityTestRelationRepository;
    @Autowired
    private JooqReactiveOperations jooqReactiveOperations;
    @Autowired
    private DataQualityCategoryMapper testsMapper;
    @Autowired
    private TablesDashboardMapper tablesDashboardMapper;

    @BeforeAll
    public void generateEntitiesAndTest() {
        generateTestsData();
    }

    @Test
    @DisplayName("Test get Latest Data Quality Runs")
    public void testGetLatestDataQualityRunsResults() {
        repository.getLatestDataQualityRunsResults(DataQualityTestFiltersDto.builder().build())
            .collectList()
            .as(StepVerifier::create)
            .assertNext(records -> dataQualityTestAssertion(testsMapper.mapToDto(records)))
            .verifyComplete();
    }

    @Test
    @DisplayName("Test get Monitored Tables")
    public void testGetMonitoredTables() {
        final int numberOfNotMonitoredTables = 5;
        IntStream.range(0, 5)
            .forEach(i -> createHollowDataSentEntityTable());

        repository.getMonitoredTables(DataQualityTestFiltersDto.builder().build())
            .collectList()
            .as(StepVerifier::create)
            .assertNext(records -> {
                final TablesDashboard tablesDashboard = tablesDashboardMapper.mapToDto(List.of(), records);
                assertEquals(numberOfNotMonitoredTables, tablesDashboard.getMonitoredTables().getNotMonitoredTables());
                assertEquals(NUMBER_OF_ASSERTION + NUMBER_OF_SCHEMA_CHANGES
                        + NUMBER_OF_COLUMN_ANOMALY + NUMBER_OF_FRESHNESS_ANOMALY + NUMBER_OF_VOLUME_ANOMALY,
                    tablesDashboard.getMonitoredTables().getMonitoredTables());
            })
            .verifyComplete();
    }

    private void generateTestsData() {
        ReactiveDataQualityRunsRepositoryTest.EXPECTED_VALUES
            .forEach((key, value) -> generateSpecificTestData(key, value.getLeft(), value.getRight()));
    }

    private void generateSpecificTestData(final DataQualityCategory category,
                                          final List<DataEntityRunStatus> statuses,
                                          final int numberOfTests) {
        IntStream.range(0, numberOfTests)
            .mapToObj(value -> createHollowDataSentEntityTable())
            .forEach(hollowEntity -> statuses.forEach(status -> {
                final DataEntityPojo assertion = createDataQualityEntityWithCategory(category);
                dataQualityTestRelationRepository.createRelations(List.of(
                    new DataQualityTestRelationsPojo()
                        .setDataQualityTestOddrn(assertion.getOddrn())
                        .setDatasetOddrn(hollowEntity.getOddrn())
                )).block();
                createTaskRun(assertion, status);
            }));
    }

    private DataEntityPojo createHollowDataSentEntityTable() {
        return dataEntityRepository
            .create(new DataEntityPojo().setOddrn(UUID.randomUUID().toString())
                .setTypeId(DataEntityTypeDto.TABLE.getId()))
            .block();
    }

    private DataEntityPojo createDataQualityEntityWithCategory(final DataQualityCategory category) {
        final JSONB jsonb = JSONB.jsonb(
            DATA_QUALITY_TEST_ATTRIBUTE.replace("{type}", category.name())
        );

        final DataEntityPojo dataEntityPojos = new DataEntityPojo()
            .setOddrn(UUID.randomUUID().toString())
            .setTypeId(DataEntityTypeDto.JOB.getId())
            .setSpecificAttributes(jsonb);

        return dataEntityRepository
            .create(dataEntityPojos)
            .block();
    }

    private void createTaskRun(final DataEntityPojo de,
                               final DataEntityRunStatus status) {
        final String jobOddrn = UUID.randomUUID().toString();
        final DataEntityTaskRunPojo dataEntityTaskRunPojo = new DataEntityTaskRunPojo()
            .setOddrn(jobOddrn)
            .setTaskOddrn(de.getOddrn())
            .setStartTime(LocalDateTime.now())
            .setEndTime(LocalDateTime.now())
            .setStatus(status.toString());

        dataEntityTaskRunRepository
            .bulkCreate(List.of(dataEntityTaskRunPojo))
            .block();

        createLatestTaskRun(de.getOddrn(), dataEntityTaskRunPojo);
    }

    private void createLatestTaskRun(final String taskOddrn,
                                     final DataEntityTaskRunPojo dataEntityTaskRunPojo) {
        final DataEntityTaskLastRunPojo dataEntityTaskLastRunPojo = new DataEntityTaskLastRunPojo();

        dataEntityTaskLastRunPojo.setTaskOddrn(taskOddrn);
        dataEntityTaskLastRunPojo.setLastTaskRunOddrn(dataEntityTaskRunPojo.getOddrn());
        dataEntityTaskLastRunPojo.setStatus(dataEntityTaskRunPojo.getStatus());
        dataEntityTaskLastRunPojo.setEndTime(dataEntityTaskRunPojo.getEndTime());

        jooqReactiveOperations.mono(DSL.insertInto(DATA_ENTITY_TASK_LAST_RUN)
                .set(jooqReactiveOperations.newRecord(DATA_ENTITY_TASK_LAST_RUN, dataEntityTaskLastRunPojo)))
            .block();
    }

    private void dataQualityTestAssertion(final List<DataQualityCategoryResults> actualResult) {
        for (final DataQualityCategoryResults result : actualResult) {
            final Pair<List<DataEntityRunStatus>, Integer> expectedStatuses =
                ReactiveDataQualityRunsRepositoryTest.EXPECTED_VALUES
                    .getOrDefault(DataQualityCategory.resolveByDescription(result.getCategory()),
                        Pair.of(List.of(), 0));

            result.getResults().forEach(testStatus -> {
                final DataEntityRunStatus expected = expectedStatuses.getLeft().stream()
                    .filter(item -> item.equals(testStatus.getStatus()))
                    .findFirst()
                    .orElse(null);
                assertEquals(testStatus.getCount(), expected == null
                    ? 0
                    : expectedStatuses.getRight());
            });
        }
    }
}
