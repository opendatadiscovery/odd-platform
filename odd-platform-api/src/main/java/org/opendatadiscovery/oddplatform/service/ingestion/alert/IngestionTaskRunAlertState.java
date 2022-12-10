package org.opendatadiscovery.oddplatform.service.ingestion.alert;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import lombok.extern.slf4j.Slf4j;
import org.opendatadiscovery.oddplatform.dto.alert.AlertStatusEnum;
import org.opendatadiscovery.oddplatform.dto.alert.AlertTypeEnum;
import org.opendatadiscovery.oddplatform.dto.ingestion.IngestionTaskRun;
import org.opendatadiscovery.oddplatform.model.tables.pojos.AlertChunkPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.AlertPojo;
import org.opendatadiscovery.oddplatform.service.ingestion.util.DateTimeUtil;

import static org.opendatadiscovery.oddplatform.dto.ingestion.IngestionTaskRun.IngestionTaskRunStatus;

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
    private final List<AlertChunkPojo> currentAlertChunkDescriptions = new ArrayList<>();

    public IngestionTaskRunAlertState(final String dataEntityOddrn, final AlertTypeEnum alertType) {
        this.dataEntityOddrn = dataEntityOddrn;
        this.alertType = alertType;

        this.descriptionFormat = switch (alertType) {
            case FAILED_JOB -> "Job %s failed with status %s";
            case FAILED_DQ_TEST -> "Test %s failed with status %s";
            default -> throw new IllegalStateException("Unknown alert type: %s".formatted(alertType));
        };
    }

    public IngestionTaskRunAlertState(final String dataEntityOddrn,
                                      final AlertTypeEnum alertType,
                                      final long lastAlertId) {
        this(dataEntityOddrn, alertType);

        this.lastAlertId = lastAlertId;
        this.lastAlertIdActive = true;
    }

    public void report(final IngestionTaskRun taskRun) {
        if (IngestionTaskRunStatus.SUCCESS.equals(taskRun.getStatus())) {
            reportSuccess();
            return;
        }

        if (TASK_RUN_FAIL_STATUSES.contains(taskRun.getStatus())) {
            reportFailed(taskRun);
            return;
        }

        log.debug("Skipping task run {} with status {} in state", taskRun.getOddrn(), taskRun.getStatus());
    }

    public List<AlertAction> getActions() {
        if (!lastAlertChunkDescriptions.isEmpty()) {
            final LocalDateTime now = DateTimeUtil.generateNow();

            final List<AlertChunkPojo> chunks = lastAlertChunkDescriptions.stream()
                .map(d -> new AlertChunkPojo()
                    .setAlertId(lastAlertId)
                    .setDescription(d)
                    .setCreatedAt(now))
                .toList();

            actions.add(new AlertAction.StackAlertAction(chunks));
        }

        if (currentAlert != null) {
            actions.add(new AlertAction.CreateAlertAction(
                currentAlert,
                Map.of(AlertAction.AlertUniqueConstraint.fromAlert(currentAlert), currentAlertChunkDescriptions)
            ));
        }

        return actions;
    }

    private void reportSuccess() {
        if (lastAlertIdActive) {
            actions.add(new AlertAction.ResolveAutomaticallyAlertAction(lastAlertId));
            lastAlertIdActive = false;
            return;
        }

        if (currentAlert != null) {
            currentAlert.setStatus(AlertStatusEnum.RESOLVED_AUTOMATICALLY.getCode());
            actions.add(new AlertAction.CreateAlertAction(
                currentAlert,
                Map.of(
                    AlertAction.AlertUniqueConstraint.fromAlert(currentAlert),
                    new ArrayList<>(currentAlertChunkDescriptions)
                )
            ));
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
                DateTimeUtil.generateNow()
            );
        }

        currentAlertChunkDescriptions.add(buildAlertChunk(taskRun, currentAlert.getLastCreatedAt()));
    }

    private AlertChunkPojo buildAlertChunk(final IngestionTaskRun taskRun, final LocalDateTime createdAt) {
        return new AlertChunkPojo().setDescription(buildDescription(taskRun)).setCreatedAt(createdAt);
    }

    private String buildDescription(final IngestionTaskRun taskRun) {
        return descriptionFormat.formatted(taskRun.getTaskRunName(), taskRun.getStatus());
    }

    private AlertPojo buildAlert(final String dataEntityOddrn,
                                 final AlertTypeEnum alertType,
                                 final String messengerOddrn,
                                 final LocalDateTime createdAt) {
        return new AlertPojo()
            .setDataEntityOddrn(dataEntityOddrn)
            .setMessengerEntityOddrn(messengerOddrn)
            .setType(alertType.getCode())
            .setStatus(AlertStatusEnum.OPEN.getCode())
            .setLastCreatedAt(createdAt)
            .setStatusUpdatedAt(createdAt);
    }
}
