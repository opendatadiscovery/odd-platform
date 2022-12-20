package org.opendatadiscovery.oddplatform.service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.collections4.MultiMapUtils;
import org.apache.commons.collections4.SetValuedMap;
import org.apache.commons.collections4.multimap.HashSetValuedHashMap;
import org.opendatadiscovery.oddplatform.annotation.ReactiveTransactional;
import org.opendatadiscovery.oddplatform.api.contract.model.Alert;
import org.opendatadiscovery.oddplatform.api.contract.model.AlertList;
import org.opendatadiscovery.oddplatform.api.contract.model.AlertStatus;
import org.opendatadiscovery.oddplatform.api.contract.model.AlertTotals;
import org.opendatadiscovery.oddplatform.auth.AuthIdentityProvider;
import org.opendatadiscovery.oddplatform.dto.alert.AlertStatusEnum;
import org.opendatadiscovery.oddplatform.dto.alert.AlertTypeEnum;
import org.opendatadiscovery.oddplatform.dto.alert.ExternalAlert;
import org.opendatadiscovery.oddplatform.exception.BadUserRequestException;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.mapper.AlertMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.AlertChunkPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.AlertPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveAlertRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataEntityRepository;
import org.opendatadiscovery.oddplatform.service.ingestion.alert.AlertAction;
import org.opendatadiscovery.oddplatform.service.ingestion.alert.AlertAction.AlertUniqueConstraint;
import org.springframework.stereotype.Service;
import org.springframework.web.util.UriComponentsBuilder;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import static java.util.Collections.emptyList;
import static java.util.Collections.singletonList;
import static java.util.stream.Collectors.toMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class AlertServiceImpl implements AlertService {
    private static final DateTimeFormatter ALERT_MANAGER_TIME_FORMATTER =
        DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private final ReactiveAlertRepository alertRepository;
    private final ReactiveDataEntityRepository dataEntityRepository;
    private final AlertMapper alertMapper;
    private final AuthIdentityProvider authIdentityProvider;

    @Override
    public Mono<AlertList> listAll(final int page, final int size) {
        return alertRepository.listAllWithStatusOpen(page, size)
            .map(alertMapper::mapAlerts);
    }

    @Override
    public Mono<AlertList> listByOwner(final int page, final int size) {
        return authIdentityProvider.fetchAssociatedOwner()
            .flatMap(o -> alertRepository.listByOwner(page, size, o.getId()))
            .map(alertMapper::mapAlerts);
    }

    @Override
    public Mono<AlertTotals> getTotals() {
        final Mono<Long> allCount = alertRepository.countAlertsWithStatusOpen();

        final Mono<OwnerPojo> owner = authIdentityProvider.fetchAssociatedOwner();

        final Mono<Long> countByOwner = owner
            .flatMap(o -> alertRepository.countAlertsWithStatusOpenByOwner(o.getId()))
            .defaultIfEmpty(0L);

        final Mono<Long> countDependent = owner
            .flatMap(o -> alertRepository.getObjectsOddrnsByOwner(o.getId()))
            .flatMap(alertRepository::countDependentObjectsAlerts)
            .defaultIfEmpty(0L);

        return Mono.zipDelayError(allCount, countByOwner, countDependent)
            .map(t -> new AlertTotals()
                .total(t.getT1())
                .myTotal(t.getT2())
                .dependentTotal(t.getT3()));
    }

    @Override
    public Mono<Alert> updateStatus(final long alertId,
                                    final AlertStatus alertStatus) {
        final AlertStatusEnum status = AlertStatusEnum.valueOf(alertStatus.name());

        final Mono<Alert> updateStatusMono = authIdentityProvider.getCurrentUser()
            .flatMap(u -> alertRepository.updateAlertStatus(alertId, status, u.username()))
            .switchIfEmpty(alertRepository.updateAlertStatus(alertId, status, null))
            .switchIfEmpty(Mono.error(new NotFoundException("Alert", alertId)))
            .then(alertRepository.get(alertId))
            .map(alertMapper::mapAlert);

        if (AlertStatusEnum.OPEN.equals(status)) {
            return alertRepository.existsOpen(alertId)
                .handle((exists, sink) -> {
                    if (exists) {
                        sink.error(new BadUserRequestException(
                            "Cannot reopen alert since the system already has an open alert of the same type"));
                    }
                })
                .then(updateStatusMono);
        }

        return updateStatusMono;
    }

    @Override
    public Mono<AlertList> getDataEntityAlerts(final long dataEntityId, final int page, final int size) {
        return checkDataEntityExistence(dataEntityId)
            .flatMap(id -> alertRepository.getAlertsByDataEntityId(id, page, size))
            .map(alertMapper::mapAlerts);
    }

    @Override
    public Mono<Long> getDataEntityAlertsCounts(final long dataEntityId, final AlertStatusEnum alertStatus) {
        return checkDataEntityExistence(dataEntityId)
            .flatMap(id -> alertRepository.getAlertsCountByDataEntityId(id, alertStatus));
    }

    @Override
    @ReactiveTransactional
    public Mono<Void> handleExternalAlerts(final List<ExternalAlert> externalAlerts) {
        if (CollectionUtils.isEmpty(externalAlerts)) {
            return Mono.empty();
        }

        final SetValuedMap<AlertUniqueConstraint, List<AlertChunkPojo>> alertToChunks =
            MultiMapUtils.newSetValuedHashMap();

        final List<AlertPojo> alerts = new ArrayList<>();
        final LocalDateTime now = LocalDateTime.now();

        for (final ExternalAlert externalAlert : externalAlerts) {
            final String alertTime = URLEncoder
                .encode(externalAlert.getStartsAt().format(ALERT_MANAGER_TIME_FORMATTER), StandardCharsets.UTF_8);

            final String queryUrl = UriComponentsBuilder.fromUri(externalAlert.getGeneratorURL())
                .queryParam("g0.moment_input", alertTime)
                .queryParam("g0.end_input", alertTime)
                .build()
                .toString();

            final AlertPojo alert = new AlertPojo()
                .setLastCreatedAt(now)
                .setStatusUpdatedAt(now)
                .setType(AlertTypeEnum.DISTRIBUTION_ANOMALY.getCode())
                .setDataEntityOddrn(externalAlert.getLabels().get("entity_oddrn"))
                .setStatus(AlertStatusEnum.OPEN.getCode());

            alerts.add(alert);

            final AlertChunkPojo chunk = new AlertChunkPojo()
                .setCreatedAt(now)
                .setDescription(String.format("Distribution Anomaly. URL: %s", queryUrl));

            alertToChunks.put(AlertUniqueConstraint.fromAlert(alert), singletonList(chunk));
        }

        return createAlerts(alerts, alertToChunks, emptyList());
    }

    @Override
    public Mono<Map<String, SetValuedMap<Short, AlertPojo>>> getOpenAlertsForEntities(
        final Collection<String> dataEntityOddrns
    ) {
        return alertRepository.getOpenAlertsForEntities(dataEntityOddrns);
    }

    @Override
    @ReactiveTransactional
    public Mono<Void> applyAlertActions(final List<AlertAction> alertActions) {
        if (CollectionUtils.isEmpty(alertActions)) {
            return Mono.empty();
        }

        final List<AlertPojo> alertsToCreate = new ArrayList<>();
        final List<Long> idsToResolve = new ArrayList<>();
        final List<AlertChunkPojo> chunks = new ArrayList<>();

        final SetValuedMap<AlertUniqueConstraint, List<AlertChunkPojo>> alertToChunks =
            MultiMapUtils.newSetValuedHashMap();

        for (final AlertAction action : alertActions) {
            if (action instanceof AlertAction.ResolveAutomaticallyAlertAction a) {
                idsToResolve.add(a.getAlertId());
            }

            if (action instanceof AlertAction.StackAlertAction a) {
                chunks.addAll(a.getChunks());
            }

            if (action instanceof AlertAction.CreateAlertAction a) {
                alertsToCreate.add(a.getAlertPojo());
                alertToChunks.putAll(a.getChunks());
            }
        }

        return createAlerts(alertsToCreate, alertToChunks, chunks)
            .then(alertRepository.resolveAutomatically(idsToResolve));
    }

    @Override
    public Mono<AlertList> listDependentObjectsAlerts(final int page, final int size) {
        return authIdentityProvider.fetchAssociatedOwner()
            .flatMap(owner -> alertRepository.getObjectsOddrnsByOwner(owner.getId()))
            .flatMap(oddrns -> alertRepository.listDependentObjectsAlerts(page, size, oddrns))
            .map(alertMapper::mapAlerts);
    }

    private Mono<Void> createAlerts(final List<AlertPojo> alerts,
                                    final SetValuedMap<AlertUniqueConstraint, List<AlertChunkPojo>> alertToChunks,
                                    final List<AlertChunkPojo> additionalChunks) {
        final SetValuedMap<AlertUniqueConstraint, List<AlertChunkPojo>> modifiableAlertToChunks =
            new HashSetValuedHashMap<>(alertToChunks);

        return alertRepository.createAlerts(alerts)
            .flatMap(createdAlert -> {
                final Set<List<AlertChunkPojo>> createdAlertChunks =
                    modifiableAlertToChunks.get(AlertUniqueConstraint.fromAlert(createdAlert));

                if (CollectionUtils.isEmpty(createdAlertChunks)) {
                    return Flux.error(new IllegalStateException("Alert chunks are empty for created alert"));
                }

                final long createdAlertId = createdAlert.getId();

                if (createdAlertChunks.size() == 1) {
                    return prepareChunksForInsert(createdAlertId, createdAlertChunks.iterator().next());
                }

                final Iterator<List<AlertChunkPojo>> iterator = createdAlertChunks.iterator();
                final List<AlertChunkPojo> chunks = iterator.next();
                iterator.remove();

                return prepareChunksForInsert(createdAlertId, chunks);
            })
            .collectList()
            .map(chunks -> Stream.concat(additionalChunks.stream(), chunks.stream()).distinct().toList())
            .flatMap(alertRepository::createChunks)
            .then(Mono.just(
                additionalChunks.stream().collect(toMap(
                    AlertChunkPojo::getAlertId,
                    AlertChunkPojo::getCreatedAt,
                    (o1, o2) -> o2
                ))
            ))
            .flatMap(alertRepository::setLastCreatedAt);
    }

    private Mono<Long> checkDataEntityExistence(final long dataEntityId) {
        return dataEntityRepository.exists(dataEntityId).handle((exists, sink) -> {
            if (!exists) {
                sink.error(new NotFoundException("Data Entity", dataEntityId));
                return;
            }
            sink.next(dataEntityId);
        });
    }

    private Flux<AlertChunkPojo> prepareChunksForInsert(final long createdAlertId,
                                                        final List<AlertChunkPojo> chunks) {
        return Flux.fromStream(chunks.stream().map(c -> new AlertChunkPojo(c).setAlertId(createdAlertId)));
    }
}