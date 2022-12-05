package org.opendatadiscovery.oddplatform.service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.collections4.SetValuedMap;
import org.opendatadiscovery.oddplatform.annotation.ReactiveTransactional;
import org.opendatadiscovery.oddplatform.api.contract.model.AlertList;
import org.opendatadiscovery.oddplatform.api.contract.model.AlertStatus;
import org.opendatadiscovery.oddplatform.api.contract.model.AlertTotals;
import org.opendatadiscovery.oddplatform.auth.AuthIdentityProvider;
import org.opendatadiscovery.oddplatform.dto.alert.AlertStatusEnum;
import org.opendatadiscovery.oddplatform.dto.alert.AlertTypeEnum;
import org.opendatadiscovery.oddplatform.dto.alert.ExternalAlert;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.mapper.AlertMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.AlertChunkPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.AlertPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveAlertRepository;
import org.opendatadiscovery.oddplatform.service.ingestion.alert.AlertAction;
import org.opendatadiscovery.oddplatform.service.ingestion.alert.AlertAction.AlertUniqueConstraint;
import org.springframework.stereotype.Service;
import org.springframework.web.util.UriComponentsBuilder;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import static java.util.Collections.emptyList;
import static java.util.Collections.singletonList;

@Service
@RequiredArgsConstructor
@Slf4j
public class AlertServiceImpl implements AlertService {
    private static final DateTimeFormatter ALERT_MANAGER_TIME_FORMATTER =
        DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private final ReactiveAlertRepository alertRepository;
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
    public Mono<AlertStatus> updateStatus(final long alertId,
                                          final AlertStatus alertStatus) {
        return authIdentityProvider.getCurrentUser()
            .flatMap(u -> alertRepository.updateAlertStatus(
                alertId, AlertStatusEnum.valueOf(alertStatus.name()), u.username()))
            .switchIfEmpty(alertRepository
                .updateAlertStatus(alertId, AlertStatusEnum.valueOf(alertStatus.name()), null))
            .switchIfEmpty(Mono.error(new NotFoundException("Alert", alertId)))
            .thenReturn(alertStatus);
    }

    @Override
    public Mono<AlertList> getDataEntityAlerts(final long dataEntityId) {
        return alertRepository.getAlertsByDataEntityId(dataEntityId)
            .map(alertMapper::mapAlerts);
    }

    @Override
    @ReactiveTransactional
    public Mono<Void> handleExternalAlerts(final List<ExternalAlert> externalAlerts) {
        if (CollectionUtils.isEmpty(externalAlerts)) {
            return Mono.empty();
        }

        final Map<AlertUniqueConstraint, List<AlertChunkPojo>> alertToChunks = new HashMap<>();
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
            alertToChunks.put(AlertUniqueConstraint.fromAlert(alert), singletonList(
                new AlertChunkPojo().setDescription(String.format("Distribution Anomaly. URL: %s", queryUrl))));
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
        final Map<AlertUniqueConstraint, List<AlertChunkPojo>> alertToChunks = new HashMap<>();

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
                                    final Map<AlertUniqueConstraint, List<AlertChunkPojo>> alertToChunks,
                                    final List<AlertChunkPojo> additionalChunks) {
        return alertRepository.createAlerts(alerts)
            .flatMap(createdAlert -> {
                final List<AlertChunkPojo> createdAlertChunks =
                    alertToChunks.get(AlertUniqueConstraint.fromAlert(createdAlert));

                if (createdAlertChunks == null) {
                    return Flux.error(new IllegalStateException("Alert chunks are empty for created alert"));
                }

                return Flux.fromStream(createdAlertChunks.stream()
                    .map(c -> new AlertChunkPojo(c).setAlertId(createdAlert.getId())));
            })
            .collectList()
            .map(chunks -> Stream.concat(additionalChunks.stream(), chunks.stream()).distinct().toList())
            .flatMap(alertRepository::createChunks);
    }
}