package org.opendatadiscovery.oddplatform.dto.ingestion;

import java.time.OffsetDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IngestionTaskRun {
    private String taskName;
    private String oddrn;
    private String dataEntityOddrn;
    private OffsetDateTime startTime;
    private OffsetDateTime endTime;
    private IngestionTaskRunStatus status;
    private String statusReason;
    private IngestionTaskRunType type;

    public enum IngestionTaskRunType {
        DATA_TRANSFORMER_RUN,
        DATA_QUALITY_TEST_RUN
    }

    public enum IngestionTaskRunStatus {
        SUCCESS,
        FAILED,
        SKIPPED,
        BROKEN,
        ABORTED,
        RUNNING,
        UNKNOWN
    }
}
