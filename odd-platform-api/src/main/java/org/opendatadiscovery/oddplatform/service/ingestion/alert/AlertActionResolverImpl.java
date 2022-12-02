package org.opendatadiscovery.oddplatform.service.ingestion.alert;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.dto.alert.AlertStatusEnum;
import org.opendatadiscovery.oddplatform.dto.alert.AlertTypeEnum;
import org.opendatadiscovery.oddplatform.dto.ingestion.IngestionTaskRun;
import org.opendatadiscovery.oddplatform.dto.ingestion.IngestionTaskRun.IngestionTaskRunType;
import org.opendatadiscovery.oddplatform.model.tables.pojos.AlertChunkPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.AlertPojo;

import static java.time.LocalDateTime.now;
import static java.util.Collections.emptyList;
import static org.opendatadiscovery.oddplatform.dto.alert.AlertTypeEnum.BACKWARDS_INCOMPATIBLE_SCHEMA;
import static org.opendatadiscovery.oddplatform.dto.alert.AlertTypeEnum.FAILED_DQ_TEST;
import static org.opendatadiscovery.oddplatform.dto.alert.AlertTypeEnum.FAILED_JOB;
import static org.opendatadiscovery.oddplatform.service.ingestion.alert.AlertAction.CreateAlertAction;
import static org.opendatadiscovery.oddplatform.service.ingestion.alert.AlertAction.StackAlertAction;

@RequiredArgsConstructor
public class AlertActionResolverImpl implements AlertActionResolver {
    private final Map<String, Map<Short, AlertPojo>> openAlerts;

    @Override
    public Stream<AlertAction> resolveActions(final Map<String, List<IngestionTaskRun>> taskRuns,
                                              final IngestionTaskRunType taskRunType) {
        return taskRuns.entrySet()
            .stream()
            .map(e -> resolveTaskRunActions(e.getKey(), e.getValue(), taskRunType, openAlerts.get(e.getKey())))
            .flatMap(Collection::stream);
    }

    @Override
    public Stream<AlertAction> resolveActions(final Collection<AlertBISCandidate> candidates) {
        return candidates.stream()
            .map(c -> {
                final Map<Short, AlertPojo> alertDict = openAlerts.get(c.dataEntityOddrn());
                if (alertDict == null) {
                    return candidateToAction(c);
                }
                final AlertPojo lastAlert = alertDict.get(BACKWARDS_INCOMPATIBLE_SCHEMA.getCode());

                return lastAlert != null ? candidateToAction(c, lastAlert.getId()) : candidateToAction(c);
            });
    }


    private List<AlertAction> resolveTaskRunActions(final String dataEntityOddrn,
                                                    final List<IngestionTaskRun> taskRuns,
                                                    final IngestionTaskRunType taskRunType,
                                                    final Map<Short, AlertPojo> alertDict) {
        final short alertTypeCode = switch (taskRunType) {
            case DATA_TRANSFORMER_RUN -> FAILED_JOB.getCode();
            case DATA_QUALITY_TEST_RUN -> FAILED_DQ_TEST.getCode();
        };

        final IngestionTaskRunAlertState state;
        if (alertDict == null) {
            state = new IngestionTaskRunAlertState(dataEntityOddrn, taskRunType);
        } else {
            final AlertPojo lastAlert = alertDict.get(alertTypeCode);

            state = lastAlert != null
                ? new IngestionTaskRunAlertState(dataEntityOddrn, taskRunType, lastAlert.getId())
                : new IngestionTaskRunAlertState(dataEntityOddrn, taskRunType);
        }

        taskRuns.stream().sorted(Comparator.comparing(IngestionTaskRun::getEndTime)).forEach(state::report);

        return state.getActions();
    }

    private CreateAlertAction candidateToAction(final AlertBISCandidate c) {
        return new CreateAlertAction(
            buildAlert(c.dataEntityOddrn(), BACKWARDS_INCOMPATIBLE_SCHEMA, null, c.description()),
            emptyList());
    }

    private AlertAction candidateToAction(final AlertBISCandidate c, final long alertId) {
        return new StackAlertAction(new AlertChunkPojo().setAlertId(alertId).setDescription(c.description()));
    }

    // TODO: duplicate
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
