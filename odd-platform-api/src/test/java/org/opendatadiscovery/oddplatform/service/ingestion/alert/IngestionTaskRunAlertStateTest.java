package org.opendatadiscovery.oddplatform.service.ingestion.alert;

import java.util.List;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.dto.alert.AlertTypeEnum;
import org.opendatadiscovery.oddplatform.dto.ingestion.IngestionTaskRun;
import org.opendatadiscovery.oddplatform.dto.ingestion.IngestionTaskRun.IngestionTaskRunStatus;
import org.opendatadiscovery.oddplatform.model.tables.pojos.AlertChunkPojo;
import org.opendatadiscovery.oddplatform.service.ingestion.alert.AlertAction.CreateAlertAction;

import static org.assertj.core.api.Assertions.assertThat;

class IngestionTaskRunAlertStateTest {

    @Test
    void failedJobChunkIncludesStatusReason() {
        final List<AlertChunkPojo> chunks = chunksFor(
            AlertTypeEnum.FAILED_JOB,
            "nightly",
            "Out of memory"
        );

        assertThat(chunks).hasSize(1);
        assertThat(chunks.get(0).getDescription())
            .isEqualTo("Job nightly failed with status FAILED: Out of memory");
    }

    @Test
    void failedDqTestChunkIncludesStatusReason() {
        final List<AlertChunkPojo> chunks = chunksFor(
            AlertTypeEnum.FAILED_DQ_TEST,
            "not_null",
            "column id had 3 nulls"
        );

        assertThat(chunks).hasSize(1);
        assertThat(chunks.get(0).getDescription())
            .isEqualTo("Test not_null failed with status FAILED: column id had 3 nulls");
    }

    @Test
    void failedJobChunkKeepsLegacyDescriptionWhenReasonIsMissing() {
        final List<AlertChunkPojo> chunks = chunksFor(
            AlertTypeEnum.FAILED_JOB,
            "nightly",
            null
        );

        assertThat(chunks).hasSize(1);
        assertThat(chunks.get(0).getDescription())
            .isEqualTo("Job nightly failed with status FAILED");
    }

    private List<AlertChunkPojo> chunksFor(final AlertTypeEnum alertType,
                                           final String taskRunName,
                                           final String statusReason) {
        final IngestionTaskRunAlertState state =
            new IngestionTaskRunAlertState("//entity", alertType);

        state.report(IngestionTaskRun.builder()
            .taskRunName(taskRunName)
            .oddrn("//entity/run/1")
            .taskOddrn("//entity")
            .status(IngestionTaskRunStatus.FAILED)
            .statusReason(statusReason)
            .build());

        final List<AlertAction> actions = state.getActions();
        assertThat(actions).hasSize(1);
        final CreateAlertAction create = (CreateAlertAction) actions.get(0);
        return create.getChunks().values().iterator().next();
    }
}
