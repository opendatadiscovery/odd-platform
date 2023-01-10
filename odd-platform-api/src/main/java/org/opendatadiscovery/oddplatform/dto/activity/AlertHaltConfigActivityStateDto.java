package org.opendatadiscovery.oddplatform.dto.activity;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;

public record AlertHaltConfigActivityStateDto(@JsonProperty("failed_job_halt_until") LocalDateTime failedJob,
                                              @JsonProperty("failed_dq_test_halt_until") LocalDateTime dqTest,
                                              @JsonProperty("incompatible_schema_halt_until") LocalDateTime incSchema,
                                              @JsonProperty("distribution_anomaly_halt_until") LocalDateTime anomaly) {
}