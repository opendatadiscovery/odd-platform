package org.opendatadiscovery.oddplatform.mapper;

import java.time.OffsetDateTime;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.dto.ingestion.IngestionTaskRun;
import org.opendatadiscovery.oddplatform.dto.ingestion.IngestionTaskRun.IngestionTaskRunStatus;
import org.opendatadiscovery.oddplatform.dto.ingestion.IngestionTaskRun.IngestionTaskRunType;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityTaskRunPojo;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;

/**
 * #1794 defect 1a: the ingestion task-run mapper used to call {@code getStartTime()/getEndTime()
 * .toLocalDateTime()} unconditionally, so an in-flight run (no end_time — both timestamps are optional on
 * the wire: {@code DataEntityRun.required = [status]}) threw a NullPointerException and 500-ed ingestion
 * before the run could ever reach the last-run rollup. These tests pin the null-safe mapping.
 */
class DataEntityTaskRunMapperImplTest {
    private final DataEntityTaskRunMapper mapper = new DataEntityTaskRunMapperImpl();

    private static IngestionTaskRun.IngestionTaskRunBuilder run() {
        return IngestionTaskRun.builder()
            .taskRunName("run")
            .oddrn("//run/1")
            .taskOddrn("//test/1")
            .type(IngestionTaskRunType.DATA_QUALITY_TEST_RUN);
    }

    @Test
    @DisplayName("an in-flight run (null end_time) maps without NPE, keeping start_time and a null end_time")
    void mapsInFlightRunWithoutNpe() {
        final IngestionTaskRun inFlight = run()
            .startTime(OffsetDateTime.parse("2026-06-01T10:00:00Z"))
            .endTime(null)
            .status(IngestionTaskRunStatus.RUNNING)
            .build();

        final DataEntityTaskRunPojo pojo = assertDoesNotThrow(() -> mapper.mapTaskRun(inFlight));

        assertEquals("RUNNING", pojo.getStatus());
        assertNotNull(pojo.getStartTime());
        assertNull(pojo.getEndTime());
    }

    @Test
    @DisplayName("a run with both timestamps null maps to nulls without NPE")
    void mapsRunWithBothTimestampsNull() {
        final IngestionTaskRun run = run()
            .startTime(null)
            .endTime(null)
            .status(IngestionTaskRunStatus.RUNNING)
            .build();

        final DataEntityTaskRunPojo pojo = assertDoesNotThrow(() -> mapper.mapTaskRun(run));

        assertNull(pojo.getStartTime());
        assertNull(pojo.getEndTime());
    }

    @Test
    @DisplayName("a completed run maps both timestamps (unchanged behaviour)")
    void mapsCompletedRun() {
        final IngestionTaskRun completed = run()
            .startTime(OffsetDateTime.parse("2026-06-01T10:00:00Z"))
            .endTime(OffsetDateTime.parse("2026-06-01T10:05:00Z"))
            .status(IngestionTaskRunStatus.SUCCESS)
            .build();

        final DataEntityTaskRunPojo pojo = mapper.mapTaskRun(completed);

        assertNotNull(pojo.getStartTime());
        assertNotNull(pojo.getEndTime());
        assertEquals("SUCCESS", pojo.getStatus());
    }
}
