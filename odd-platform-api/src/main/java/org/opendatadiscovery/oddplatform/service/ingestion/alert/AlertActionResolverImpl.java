package org.opendatadiscovery.oddplatform.service.ingestion.alert;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.Comparator;
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

import static java.time.LocalDateTime.now;
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
        final LocalDateTime baseline = now();

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

        final LocalDateTime baseline = now();

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
                    .orElse(candidateToAction(e.getKey(), e.getValue()));
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
                    .flatMap(trs -> {
                        final IngestionTaskRunAlertState state =
                            new IngestionTaskRunAlertState(dataEntityOddrn, alertType);

                        trs.forEach(state::report);

                        return state.getActions().stream();
                    });
            }

            final Set<AlertPojo> lastAlerts = alertDict.get(alertType.getCode());

            if (lastAlerts == null) {
                return taskRunsByMessenger.values().stream()
                    .flatMap(trs -> {
                        final IngestionTaskRunAlertState state =
                            new IngestionTaskRunAlertState(dataEntityOddrn, alertType);

                        trs.forEach(state::report);

                        return state.getActions().stream();
                    });
            }

            final Map<String, AlertPojo> lastAlertsByMessenger = lastAlerts
                .stream().collect(toMap(AlertPojo::getMessengerEntityOddrn, identity()));

            return taskRunsByMessenger.entrySet().stream()
                .flatMap(e -> {
                    final AlertPojo lastAlert = lastAlertsByMessenger.get(e.getKey());
                    if (lastAlert == null) {
                        throw new IllegalStateException("Inconsistent data");
                    }

                    final IngestionTaskRunAlertState state =
                        new IngestionTaskRunAlertState(dataEntityOddrn, alertType, lastAlert.getId());

                    e.getValue().forEach(state::report);

                    return state.getActions().stream();
                });
        }

        final IngestionTaskRunAlertState state;
        if (alertDict == null) {
            state = new IngestionTaskRunAlertState(dataEntityOddrn, alertType);
        } else {
            final Set<AlertPojo> lastAlerts = alertDict.get(alertType.getCode());
            if (CollectionUtils.isEmpty(lastAlerts)) {
                state = new IngestionTaskRunAlertState(dataEntityOddrn, alertType);
            } else {
                final AlertPojo lastAlert = lastAlerts.stream().findFirst().get();
                state = new IngestionTaskRunAlertState(dataEntityOddrn, alertType, lastAlert.getId());
            }
        }

        taskRuns.stream().sorted(Comparator.comparing(IngestionTaskRun::getEndTime)).forEach(state::report);

        return state.getActions().stream();
    }

    private AlertAction candidateToAction(final String dataEntityOddrn, final List<AlertBISCandidate> candidates) {
        return candidateToAction(dataEntityOddrn, candidates, null);
    }

    private AlertAction candidateToAction(final String dataEntityOddrn,
                                          final List<AlertBISCandidate> candidates,
                                          final Long alertId) {
        final List<AlertChunkPojo> chunks = candidates.stream()
            .map(c -> new AlertChunkPojo().setDescription(c.description()))
            .toList();

        if (alertId == null) {
            final AlertUniqueConstraint constraint =
                new AlertUniqueConstraint(dataEntityOddrn, BACKWARDS_INCOMPATIBLE_SCHEMA.getCode(), null);

            return new CreateAlertAction(constraint.toOpenAlert(), Map.of(constraint, chunks));
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

        return haltUntil.compareTo(baseline) > 0;
    }
}
