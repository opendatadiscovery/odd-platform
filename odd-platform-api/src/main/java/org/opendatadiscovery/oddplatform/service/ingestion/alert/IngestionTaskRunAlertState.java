package org.opendatadiscovery.oddplatform.service.ingestion.alert;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import lombok.extern.slf4j.Slf4j;
import org.opendatadiscovery.oddplatform.dto.alert.AlertStatusEnum;
import org.opendatadiscovery.oddplatform.dto.alert.AlertTypeEnum;
import org.opendatadiscovery.oddplatform.dto.ingestion.IngestionTaskRun;
import org.opendatadiscovery.oddplatform.model.tables.pojos.AlertChunkPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.AlertPojo;

import static java.time.LocalDateTime.now;
import static org.opendatadiscovery.oddplatform.dto.ingestion.IngestionTaskRun.IngestionTaskRunStatus;
import static org.opendatadiscovery.oddplatform.dto.ingestion.IngestionTaskRun.IngestionTaskRunType;

@Slf4j
public class IngestionTaskRunAlertState {
    private static final Set<IngestionTaskRunStatus> TASK_RUN_FAIL_STATUSES = Set.of(
        IngestionTaskRunStatus.BROKEN,
        IngestionTaskRunStatus.FAILED
    );

    private final List<AlertAction> actions = new ArrayList<>();
    private final String dataEntityOddrn;
    private final String descriptionFormat;
    private final AlertTypeEnum alertType;

    private Long lastAlertId;

    private final List<String> lastAlertChunkDescriptions = new ArrayList<>();
    private boolean lastAlertIdActive;

    private AlertPojo currentAlert;
    private final List<String> currentAlertChunkDescriptions = new ArrayList<>();

    public IngestionTaskRunAlertState(final String dataEntityOddrn, final IngestionTaskRunType taskRunType) {
        this.dataEntityOddrn = dataEntityOddrn;

        switch (taskRunType) {
            case DATA_TRANSFORMER_RUN -> {
                this.descriptionFormat = "Job %s failed with status %s";
                this.alertType = AlertTypeEnum.FAILED_JOB;
            }
            case DATA_QUALITY_TEST_RUN -> {
                this.descriptionFormat = "Test %s failed with status %s";
                this.alertType = AlertTypeEnum.FAILED_DQ_TEST;
            }
            default -> throw new IllegalStateException("Unknown task run type: %s".formatted(taskRunType));
        }
    }

    public IngestionTaskRunAlertState(final String dataEntityOddrn,
                                      final IngestionTaskRunType taskRunType,
                                      final long lastAlertId) {
        this(dataEntityOddrn, taskRunType);

        this.lastAlertId = lastAlertId;
        this.lastAlertIdActive = true;
    }

    public void report(final IngestionTaskRun taskRun) {
        if (IngestionTaskRunStatus.SUCCESS.equals(taskRun.getStatus())) {
            reportSuccess();
        }

        if (TASK_RUN_FAIL_STATUSES.contains(taskRun.getStatus())) {
            reportFailed(taskRun);
        }

        log.debug("Skipping task run {} with status {} in state", taskRun.getOddrn(), taskRun.getStatus());
    }

    public List<AlertAction> getActions() {
        if (!lastAlertChunkDescriptions.isEmpty()) {
            final List<AlertChunkPojo> chunks = lastAlertChunkDescriptions.stream()
                .map(d -> new AlertChunkPojo().setAlertId(lastAlertId).setDescription(d))
                .toList();

            actions.add(new AlertAction.StackAlertAction(chunks));
        }

        if (currentAlert != null) {
            actions.add(new AlertAction.CreateAlertAction(currentAlert, currentAlertChunkDescriptions));
        }

        return actions;
    }

    private void reportSuccess() {
        if (lastAlertIdActive) {
            actions.add(new AlertAction.ResolveAutomaticallyAlertAction(lastAlertId));
            lastAlertIdActive = false;
        }

        if (currentAlert != null) {
            currentAlert.setStatus(AlertStatusEnum.RESOLVED_AUTOMATICALLY.getCode());
            actions.add(new AlertAction.CreateAlertAction(currentAlert, currentAlertChunkDescriptions));
            currentAlert = null;
            currentAlertChunkDescriptions.clear();
        }
    }

    private void reportFailed(final IngestionTaskRun taskRun) {
        if (lastAlertIdActive) {
            lastAlertChunkDescriptions.add(buildDescription(taskRun));
            return;
        }

        if (currentAlert == null) {
            currentAlert = buildAlert(
                dataEntityOddrn,
                alertType,
                alertType == AlertTypeEnum.FAILED_DQ_TEST ? taskRun.getTaskOddrn() : null,
                buildDescription(taskRun)
            );
        } else {
            currentAlertChunkDescriptions.add(buildDescription(taskRun));
        }
    }

    private String buildDescription(final IngestionTaskRun taskRun) {
        return descriptionFormat.formatted(taskRun.getTaskRunName(), taskRun.getStatus());
    }

    private AlertPojo buildAlert(final String dataEntityOddrn,
                                 final AlertTypeEnum alertType,
                                 final String messengerOddrn,
                                 final String description) {
        final LocalDateTime now = now();

        return new AlertPojo()
            .setDataEntityOddrn(dataEntityOddrn)
            .setDescription(description)
            .setMessengerEntityOddrn(messengerOddrn)
            .setType(alertType.getCode())
            .setStatus(AlertStatusEnum.OPEN.getCode())
            .setLastCreatedAt(now)
            .setStatusUpdatedAt(now);
    }
}
