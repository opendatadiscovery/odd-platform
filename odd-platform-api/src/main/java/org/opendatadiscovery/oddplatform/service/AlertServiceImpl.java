package org.opendatadiscovery.oddplatform.service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.annotation.ReactiveTransactional;
import org.opendatadiscovery.oddplatform.api.contract.model.AlertList;
import org.opendatadiscovery.oddplatform.api.contract.model.AlertStatus;
import org.opendatadiscovery.oddplatform.api.contract.model.AlertTotals;
import org.opendatadiscovery.oddplatform.auth.AuthIdentityProvider;
import org.opendatadiscovery.oddplatform.dto.alert.AlertStatusEnum;
import org.opendatadiscovery.oddplatform.dto.alert.AlertTypeEnum;
import org.opendatadiscovery.oddplatform.dto.alert.ExternalAlert;
import org.opendatadiscovery.oddplatform.mapper.AlertMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.AlertPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveAlertRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.util.UriComponentsBuilder;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
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
            .thenReturn(alertStatus);
    }

    @Override
    public Mono<AlertList> getDataEntityAlerts(final long dataEntityId) {
        return alertRepository.getAlertsByDataEntityId(dataEntityId)
            .map(alertMapper::mapAlerts);
    }

    @Override
    // TODO: handle other alert types
    @ReactiveTransactional
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
                .setCreatedAt(now)
                .setStatusUpdatedAt(now)
                .setType(AlertTypeEnum.DISTRIBUTION_ANOMALY.name())
                .setDataEntityOddrn(a.getLabels().get("entity_oddrn"))
                .setDescription(String.format("Distribution Anomaly. URL: %s", queryUrl))
                .setStatus(AlertStatusEnum.OPEN.name());
        }).collect(Collectors.toList());

        return createAlerts(alerts).then();
    }

    @Override
    public Mono<List<AlertPojo>> createAlerts(final List<AlertPojo> alerts) {
        return alertRepository.getExistingMessengers(alerts)
            .flatMap(em -> createAlerts(alerts, em))
            .switchIfEmpty(createAlerts(alerts, Set.of()));
    }

    private Mono<List<AlertPojo>> createAlerts(final List<AlertPojo> alerts, final Set<String> em) {
        final List<AlertPojo> alertPojos = alerts.stream()
            .filter(
                a -> a.getMessengerEntityOddrn() == null || !em.contains(a.getMessengerEntityOddrn()))
            .toList();
        return alertRepository.createAlerts(alertPojos);
    }

    @Override
    public Mono<AlertList> listDependentObjectsAlerts(final int page, final int size) {
        return authIdentityProvider.fetchAssociatedOwner()
            .flatMap(owner -> alertRepository.getObjectsOddrnsByOwner(owner.getId()))
            .flatMap(oddrns -> alertRepository.listDependentObjectsAlerts(page, size, oddrns))
            .map(alertMapper::mapAlerts);
    }
}
