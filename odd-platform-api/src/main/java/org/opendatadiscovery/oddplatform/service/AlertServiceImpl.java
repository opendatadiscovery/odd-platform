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
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
    public Mono<Void> handleExternalAlerts(final List<ExternalAlert> externalAlerts) {
        final List<AlertPojo> alerts = externalAlerts.stream().map(a -> {
            final String alertTime =
                URLEncoder.encode(a.getStartsAt().format(ALERT_MANAGER_TIME_FORMATTER), StandardCharsets.UTF_8);

            final String queryUrl = UriComponentsBuilder.fromUri(a.getGeneratorURL())
                .queryParam("g0.moment_input", alertTime)
                .queryParam("g0.end_input", alertTime)
                .build()
                .toString();

            final LocalDateTime now = LocalDateTime.now();

            return new AlertPojo()
                .setLastCreatedAt(now)
                .setStatusUpdatedAt(now)
                .setType(AlertTypeEnum.DISTRIBUTION_ANOMALY.getCode())
                .setDataEntityOddrn(a.getLabels().get("entity_oddrn"))
                .setDescription(String.format("Distribution Anomaly. URL: %s", queryUrl))
                .setStatus(AlertStatusEnum.OPEN.getCode());
        }).collect(Collectors.toList());

        return createAlerts(alerts).then();
    }

    @Override
    public Mono<List<AlertPojo>> createAlerts(final List<AlertPojo> alerts) {
        return alertRepository.getExistingMessengers(alerts)
            .flatMap(em -> createAlerts(alerts, em))
            .switchIfEmpty(createAlerts(alerts, Set.of()));
    }

    @Override
    public Mono<Map<String, Map<Short, AlertPojo>>> getOpenAlertsForEntities(
        final Collection<String> dataEntityOddrns
    ) {
        return alertRepository.getOpenAlertsForEntities(dataEntityOddrns);
    }

    @Override
    @ReactiveTransactional
    public Mono<Void> applyAlertActions(final List<AlertAction> alertActions) {
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

        return alertRepository.createAlerts(alertsToCreate)
            .flatMap(createdAlert -> {
                final List<AlertChunkPojo> createdAlertChunks =
                    alertToChunks.get(AlertUniqueConstraint.fromAlert(createdAlert));

                if (createdAlertChunks == null) {
                    return Flux.error(new IllegalStateException("Alert chunks are empty for created alert"));
                }

                return Flux.fromStream(createdAlertChunks.stream()
                    .map(c -> new AlertChunkPojo(c).setAlertId(createdAlert.getId())));
            })
            .mergeWith(Flux.fromIterable(chunks))
            .collectList()
            .flatMap(alertRepository::createChunks)
            .then(alertRepository.resolveAutomatically(idsToResolve));
    }

    @Override
    public Mono<AlertList> listDependentObjectsAlerts(final int page, final int size) {
        return authIdentityProvider.fetchAssociatedOwner()
            .flatMap(owner -> alertRepository.getObjectsOddrnsByOwner(owner.getId()))
            .flatMap(oddrns -> alertRepository.listDependentObjectsAlerts(page, size, oddrns))
            .map(alertMapper::mapAlerts);
    }

    private Mono<List<AlertPojo>> createAlerts(final List<AlertPojo> alerts, final Set<String> em) {
        final List<AlertPojo> alertPojos = alerts.stream()
            .filter(a -> a.getMessengerEntityOddrn() == null || !em.contains(a.getMessengerEntityOddrn()))
            .toList();

        return alertRepository.createAlerts(alertPojos).collectList();
    }
}
