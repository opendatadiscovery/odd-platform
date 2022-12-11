package org.opendatadiscovery.oddplatform.service.ingestion.alert;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.collections4.SetValuedMap;
import org.opendatadiscovery.oddplatform.dto.alert.AlertTypeEnum;
import org.opendatadiscovery.oddplatform.dto.ingestion.IngestionTaskRun;
import org.opendatadiscovery.oddplatform.dto.ingestion.IngestionTaskRun.IngestionTaskRunType;
import org.opendatadiscovery.oddplatform.model.tables.pojos.AlertChunkPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.AlertHaltConfigPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.AlertPojo;
import org.opendatadiscovery.oddplatform.service.ingestion.util.DateTimeUtil;

import static java.util.function.Function.identity;
import static java.util.stream.Collectors.groupingBy;
import static java.util.stream.Collectors.toList;
import static java.util.stream.Collectors.toMap;
import static org.opendatadiscovery.oddplatform.dto.alert.AlertTypeEnum.BACKWARDS_INCOMPATIBLE_SCHEMA;
import static org.opendatadiscovery.oddplatform.dto.alert.AlertTypeEnum.FAILED_DQ_TEST;
import static org.opendatadiscovery.oddplatform.dto.alert.AlertTypeEnum.FAILED_JOB;
import static org.opendatadiscovery.oddplatform.service.ingestion.alert.AlertAction.AlertUniqueConstraint;
import static org.opendatadiscovery.oddplatform.service.ingestion.alert.AlertAction.CreateAlertAction;
import static org.opendatadiscovery.oddplatform.service.ingestion.alert.AlertAction.ResolveAutomaticallyAlertAction;
import static org.opendatadiscovery.oddplatform.service.ingestion.alert.AlertAction.StackAlertAction;

@RequiredArgsConstructor
public class AlertActionResolverImpl implements AlertActionResolver {
    private final Map<String, SetValuedMap<Short, AlertPojo>> openAlerts;
    private final Map<String, AlertHaltConfigPojo> haltConfigs;

    @Override
    public Stream<AlertAction> resolveActions(final Map<String, List<IngestionTaskRun>> taskRuns,
                                              final IngestionTaskRunType taskRunType) {
        final LocalDateTime baseline = DateTimeUtil.generateNow();

        return taskRuns.entrySet()
            .stream()
            .flatMap(e -> {
                final AlertTypeEnum alertType = switch (taskRunType) {
                    case DATA_TRANSFORMER_RUN -> FAILED_JOB;
                    case DATA_QUALITY_TEST_RUN -> FAILED_DQ_TEST;
                };

                final boolean toHalt = toHalt(haltConfigs.get(e.getKey()), alertType, baseline);

                return resolveTaskRunActions(e.getKey(), e.getValue(), alertType, openAlerts.get(e.getKey()))
                    .filter(a -> !toHalt || a instanceof ResolveAutomaticallyAlertAction);
            });
    }

    @Override
    public Stream<AlertAction> resolveActions(final Collection<AlertBISCandidate> candidates) {
        if (CollectionUtils.isEmpty(candidates)) {
            return Stream.empty();
        }

        final LocalDateTime baseline = DateTimeUtil.generateNow();

        return candidates.stream()
            .collect(groupingBy(AlertBISCandidate::dataEntityOddrn, toList()))
            .entrySet()
            .stream()
            .map(e -> {
                if (toHalt(haltConfigs.get(e.getKey()), AlertTypeEnum.BACKWARDS_INCOMPATIBLE_SCHEMA, baseline)) {
                    return null;
                }

                final SetValuedMap<Short, AlertPojo> alertDict = openAlerts.get(e.getKey());
                if (alertDict == null) {
                    return candidateToAction(e.getKey(), e.getValue());
                }

                return alertDict.get(BACKWARDS_INCOMPATIBLE_SCHEMA.getCode()).stream().findFirst()
                    .map(lastAlert -> candidateToAction(e.getKey(), e.getValue(), lastAlert.getId()))
                    .orElseGet(() -> candidateToAction(e.getKey(), e.getValue()));
            })
            .filter(Objects::nonNull);
    }

    private Stream<AlertAction> resolveTaskRunActions(final String dataEntityOddrn,
                                                      final List<IngestionTaskRun> taskRuns,
                                                      final AlertTypeEnum alertType,
                                                      final SetValuedMap<Short, AlertPojo> alertDict) {
        if (FAILED_DQ_TEST.equals(alertType)) {
            final Map<String, List<IngestionTaskRun>> taskRunsByMessenger = taskRuns.stream()
                .collect(groupingBy(IngestionTaskRun::getTaskOddrn, toList()));

            if (alertDict == null) {
                return taskRunsByMessenger.values().stream()
                    .flatMap(trs -> streamActions(trs, dataEntityOddrn, alertType));
            }

            final Set<AlertPojo> lastAlerts = alertDict.get(alertType.getCode());

            if (lastAlerts == null) {
                return taskRunsByMessenger.values().stream()
                    .flatMap(trs -> streamActions(trs, dataEntityOddrn, alertType));
            }

            final Map<String, AlertPojo> lastAlertsByMessenger = lastAlerts
                .stream().collect(toMap(AlertPojo::getMessengerEntityOddrn, identity()));

            return taskRunsByMessenger.entrySet().stream()
                .flatMap(e -> {
                    final AlertPojo lastAlert = lastAlertsByMessenger.get(e.getKey());
                    if (lastAlert == null) {
                        throw new IllegalStateException("Internal inconsistent data of messengers oddrns to task runs");
                    }

                    return streamActions(e.getValue(), dataEntityOddrn, alertType, lastAlert.getId());
                });
        }

        if (alertDict == null) {
            return streamActions(taskRuns, dataEntityOddrn, alertType);
        } else {
            final Set<AlertPojo> lastAlerts = alertDict.get(alertType.getCode());
            return CollectionUtils.isEmpty(lastAlerts)
                ? streamActions(taskRuns, dataEntityOddrn, alertType)
                : streamActions(taskRuns, dataEntityOddrn, alertType, lastAlerts.iterator().next().getId());
        }
    }

    private Stream<AlertAction> streamActions(final List<IngestionTaskRun> trs,
                                              final String dataEntityOddrn,
                                              final AlertTypeEnum alertType) {
        return streamActions(trs, dataEntityOddrn, alertType, null);
    }

    private Stream<AlertAction> streamActions(final List<IngestionTaskRun> trs,
                                              final String dataEntityOddrn,
                                              final AlertTypeEnum alertType,
                                              final Long lastAlertId) {
        final IngestionTaskRunAlertState state = lastAlertId == null
            ? new IngestionTaskRunAlertState(dataEntityOddrn, alertType)
            : new IngestionTaskRunAlertState(dataEntityOddrn, alertType, lastAlertId);

        trs.forEach(state::report);

        return state.getActions().stream();
    }

    private AlertAction candidateToAction(final String dataEntityOddrn, final List<AlertBISCandidate> candidates) {
        return candidateToAction(dataEntityOddrn, candidates, null);
    }

    private AlertAction candidateToAction(final String dataEntityOddrn,
                                          final List<AlertBISCandidate> candidates,
                                          final Long alertId) {
        final LocalDateTime now = DateTimeUtil.generateNow();

        final List<AlertChunkPojo> chunks = candidates.stream()
            .map(c -> new AlertChunkPojo()
                .setAlertId(alertId)
                .setDescription(c.description())
                .setCreatedAt(now))
            .toList();

        if (alertId == null) {
            final AlertUniqueConstraint constraint =
                new AlertUniqueConstraint(dataEntityOddrn, BACKWARDS_INCOMPATIBLE_SCHEMA.getCode(), null);

            return new CreateAlertAction(constraint.toOpenAlert(now), Map.of(constraint, chunks));
        }

        return new StackAlertAction(chunks);
    }

    private boolean toHalt(final AlertHaltConfigPojo haltCfg,
                           final AlertTypeEnum targetAlertType,
                           final LocalDateTime baseline) {
        if (haltCfg == null) {
            return false;
        }

        final LocalDateTime haltUntil = switch (targetAlertType) {
            case FAILED_JOB -> haltCfg.getFailedJobHaltUntil();
            case FAILED_DQ_TEST -> haltCfg.getFailedDqTestHaltUntil();
            case BACKWARDS_INCOMPATIBLE_SCHEMA -> haltCfg.getIncompatibleSchemaHaltUntil();
            case DISTRIBUTION_ANOMALY -> haltCfg.getDistributionAnomalyHaltUntil();
        };

        return haltUntil != null && haltUntil.isAfter(baseline);
    }
}
