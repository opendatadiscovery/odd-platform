package org.opendatadiscovery.oddplatform.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import org.jooq.Record1;
import org.jooq.impl.DSL;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.BaseIntegrationTest;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityRunStatus;
import org.opendatadiscovery.oddplatform.api.contract.model.TablesDashboard;
import org.opendatadiscovery.oddplatform.api.contract.model.TablesHealthDashboard;
import org.opendatadiscovery.oddplatform.dto.DataEntityTypeDto;
import org.opendatadiscovery.oddplatform.dto.DataQualityTestFiltersDto;
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
import org.springframework.beans.factory.annotation.Autowired;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.opendatadiscovery.oddplatform.api.contract.model.DataEntityRunStatus.ABORTED;
import static org.opendatadiscovery.oddplatform.api.contract.model.DataEntityRunStatus.BROKEN;
import static org.opendatadiscovery.oddplatform.api.contract.model.DataEntityRunStatus.FAILED;
import static org.opendatadiscovery.oddplatform.api.contract.model.DataEntityRunStatus.RUNNING;
import static org.opendatadiscovery.oddplatform.api.contract.model.DataEntityRunStatus.SKIPPED;
import static org.opendatadiscovery.oddplatform.api.contract.model.DataEntityRunStatus.SUCCESS;
import static org.opendatadiscovery.oddplatform.api.contract.model.DataEntityRunStatus.UNKNOWN;
import static org.opendatadiscovery.oddplatform.model.tables.DataEntityTaskLastRun.DATA_ENTITY_TASK_LAST_RUN;

/**
 * #1794 defect 2 (Table Health priority cascade) + defect 1 (in-flight runs in the last-run rollup).
 * A fresh DB per class (BaseIntegrationTest @DirtiesContext BEFORE_CLASS + a per-context oddN database),
 * so the bucket counts asserted below are exactly the data this test creates.
 */
public class ReactiveDataQualityTableHealthTest extends BaseIntegrationTest {
    @Autowired
    private ReactiveDataQualityRunsRepository repository;
    @Autowired
    private ReactiveDataEntityTaskRunRepository taskRunRepository;
    @Autowired
    private ReactiveDataEntityRepository dataEntityRepository;
    @Autowired
    private ReactiveDataQualityTestRelationRepository relationRepository;
    @Autowired
    private JooqReactiveOperations jooqReactiveOperations;
    @Autowired
    private TablesDashboardMapper tablesDashboardMapper;

    @Test
    @DisplayName("Table Health is a priority cascade: Error>Warning>Unknown>Healthy (#1794)")
    public void testTableHealthCascade() {
        tableWithTestStatuses(FAILED);            // error
        tableWithTestStatuses(BROKEN);            // warning
        tableWithTestStatuses(UNKNOWN);           // unknown
        tableWithTestStatuses(SUCCESS);           // healthy
        tableWithTestStatuses(SKIPPED);           // healthy (was wrongly Warning before #1794)
        tableWithTestStatuses(ABORTED);           // healthy
        tableWithTestStatuses(RUNNING);           // healthy (a running test must not degrade health)
        tableWithTestStatuses(FAILED, BROKEN);    // error    — FAILED outranks BROKEN
        tableWithTestStatuses(UNKNOWN, BROKEN);   // warning  — BROKEN outranks UNKNOWN
        tableWithTestStatuses(SUCCESS, RUNNING);  // healthy  — no failing status present

        final TablesHealthDashboard health = tablesHealth();

        assertEquals(5, health.getHealthyTables(), "success, skipped, aborted, running, success+running");
        assertEquals(2, health.getErrorTables(), "failed, failed+broken");
        assertEquals(2, health.getWarningTables(), "broken, unknown+broken");
        assertEquals(1, health.getUnknownTables(), "unknown only");
    }

    @Test
    @DisplayName("insertLastRuns records an in-flight RUNNING run as the latest (#1794 defect 1)")
    public void testInsertLastRunsRecordsInFlightRun() {
        final String testOddrn = createTest().getOddrn();

        final DataEntityTaskRunPojo completed = run(testOddrn, SUCCESS,
            LocalDateTime.parse("2026-06-01T10:00:00"), LocalDateTime.parse("2026-06-01T10:05:00"));
        taskRunRepository.bulkCreate(List.of(completed)).block();
        taskRunRepository.insertLastRuns(List.of(completed)).block();
        assertEquals(SUCCESS.getValue(), lastRunStatus(testOddrn), "the completed run is the latest");

        // a later in-flight run (no end_time) must become the latest — previously dropped (end_time != null filter)
        final DataEntityTaskRunPojo inFlight = run(testOddrn, RUNNING,
            LocalDateTime.parse("2026-06-01T11:00:00"), null);
        taskRunRepository.bulkCreate(List.of(inFlight)).block();
        taskRunRepository.insertLastRuns(List.of(inFlight)).block();
        assertEquals(RUNNING.getValue(), lastRunStatus(testOddrn), "the in-flight run is now the latest");
    }

    // ---- helpers ----

    private TablesHealthDashboard tablesHealth() {
        final TablesDashboard dashboard = repository
            .getLatestTablesHealth(DataQualityTestFiltersDto.builder().build())
            .collectList()
            .map(rows -> tablesDashboardMapper.mapToDto(rows, List.of()))
            .block();
        return dashboard.getTablesHealth();
    }

    private void tableWithTestStatuses(final DataEntityRunStatus... statuses) {
        final String tableOddrn = createTable().getOddrn();
        for (final DataEntityRunStatus status : statuses) {
            final String testOddrn = createTest().getOddrn();
            relationRepository.createRelations(List.of(new DataQualityTestRelationsPojo()
                .setDataQualityTestOddrn(testOddrn)
                .setDatasetOddrn(tableOddrn))).block();
            setLastRun(testOddrn, status);
        }
    }

    private DataEntityPojo createTable() {
        return dataEntityRepository.create(new DataEntityPojo()
            .setOddrn(UUID.randomUUID().toString())
            .setTypeId(DataEntityTypeDto.TABLE.getId())).block();
    }

    private DataEntityPojo createTest() {
        return dataEntityRepository.create(new DataEntityPojo()
            .setOddrn(UUID.randomUUID().toString())
            .setTypeId(DataEntityTypeDto.JOB.getId())).block();
    }

    private DataEntityTaskRunPojo run(final String testOddrn, final DataEntityRunStatus status,
                                     final LocalDateTime start, final LocalDateTime end) {
        return new DataEntityTaskRunPojo()
            .setOddrn(UUID.randomUUID().toString())
            .setTaskOddrn(testOddrn)
            .setStartTime(start)
            .setEndTime(end)
            .setStatus(status.getValue());
    }

    private void setLastRun(final String testOddrn, final DataEntityRunStatus status) {
        final DataEntityTaskRunPojo taskRun = run(testOddrn, status,
            LocalDateTime.now().minusMinutes(1), LocalDateTime.now());
        taskRunRepository.bulkCreate(List.of(taskRun)).block();

        final DataEntityTaskLastRunPojo lastRun = new DataEntityTaskLastRunPojo();
        lastRun.setTaskOddrn(testOddrn);
        lastRun.setLastTaskRunOddrn(taskRun.getOddrn());
        lastRun.setStartTime(taskRun.getStartTime());
        lastRun.setEndTime(taskRun.getEndTime());
        lastRun.setStatus(taskRun.getStatus());
        jooqReactiveOperations.mono(DSL.insertInto(DATA_ENTITY_TASK_LAST_RUN)
            .set(jooqReactiveOperations.newRecord(DATA_ENTITY_TASK_LAST_RUN, lastRun))).block();
    }

    private String lastRunStatus(final String testOddrn) {
        return jooqReactiveOperations.mono(DSL.select(DATA_ENTITY_TASK_LAST_RUN.STATUS)
                .from(DATA_ENTITY_TASK_LAST_RUN)
                .where(DATA_ENTITY_TASK_LAST_RUN.TASK_ODDRN.eq(testOddrn)))
            .map(Record1::value1)
            .block();
    }
}
