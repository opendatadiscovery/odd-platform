package org.opendatadiscovery.oddplatform.service.ingestion.alert;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import org.apache.commons.lang3.ArrayUtils;
import org.opendatadiscovery.oddplatform.dto.alert.AlertStatusEnum;
import org.opendatadiscovery.oddplatform.dto.alert.AlertTypeEnum;
import org.opendatadiscovery.oddplatform.dto.ingestion.IngestionTaskRun;
import org.opendatadiscovery.oddplatform.model.tables.pojos.AlertPojo;

import static java.time.LocalDateTime.now;
import static org.opendatadiscovery.oddplatform.dto.ingestion.IngestionTaskRun.IngestionTaskRunStatus;

public class IngestionTaskRunAlertState {
    private static final Set<IngestionTaskRunStatus> TASK_RUN_FAIL_STATUSES = Set.of(
        IngestionTaskRunStatus.BROKEN,
        IngestionTaskRunStatus.FAILED
    );

    private final List<AlertAction> actions = new ArrayList<>();
    private final String dataEntityOddrn;

    private Long lastAlertId;
    private List<String> alertPartDescriptions = new ArrayList<>();
    private boolean lastAlertIdActive;

    private AlertPojo currentAlert;

    public IngestionTaskRunAlertState(final String dataEntityOddrn) {
        this.dataEntityOddrn = dataEntityOddrn;
    }

    public IngestionTaskRunAlertState(final String dataEntityOddrn, final long lastAlertId) {
        this.lastAlertId = lastAlertId;
        this.lastAlertIdActive = true;
        this.dataEntityOddrn = dataEntityOddrn;
    }

    public void report(final IngestionTaskRun taskRun) {
        if (IngestionTaskRunStatus.SUCCESS.equals(taskRun.getStatus())) {
            reportSuccess();
        }

        if (TASK_RUN_FAIL_STATUSES.contains(taskRun.getStatus())) {
            reportFailed(taskRun);
        }
    }

    public List<AlertAction> getActions() {
        if (!alertPartDescriptions.isEmpty()) {
            actions.add(new AlertAction.StackAlertAction(lastAlertId, alertPartDescriptions));
        }

        if (currentAlert != null) {
            actions.add(new AlertAction.CreateAlertAction(currentAlert));
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
            actions.add(new AlertAction.CreateAlertAction(currentAlert));
            currentAlert = null;
        }
    }

    private void reportFailed(final IngestionTaskRun taskRun) {
        if (lastAlertIdActive) {
            alertPartDescriptions.add("");
        }

        if (currentAlert == null) {
            final AlertTypeEnum alertType = switch (taskRun.getType()) {
                case DATA_TRANSFORMER_RUN -> AlertTypeEnum.FAILED_JOB;
                case DATA_QUALITY_TEST_RUN -> AlertTypeEnum.FAILED_DQ_TEST;
            };

            // TODO: messenger oddrn and description
            currentAlert = buildAlert(dataEntityOddrn, alertType, null, "");
        } else {
            // TODO: not effective array op
            // TODO: end_time?
            final LocalDateTime now = now();
            // TODO: test that last created at is put right
            currentAlert.setCreatedAts(ArrayUtils.add(currentAlert.getCreatedAts(), now));
            currentAlert.setLastCreatedAt(now);
        }
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
