package org.opendatadiscovery.oddplatform.service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.model.AlertList;
import org.opendatadiscovery.oddplatform.api.contract.model.AlertStatus;
import org.opendatadiscovery.oddplatform.api.contract.model.AlertTotals;
import org.opendatadiscovery.oddplatform.api.contract.model.AlertType;
import org.opendatadiscovery.oddplatform.auth.AuthIdentityProvider;
import org.opendatadiscovery.oddplatform.dto.AlertStatusEnum;
import org.opendatadiscovery.oddplatform.dto.ExternalAlert;
import org.opendatadiscovery.oddplatform.mapper.AlertMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.AlertPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerPojo;
import org.opendatadiscovery.oddplatform.repository.AlertRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.util.UriComponentsBuilder;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class AlertServiceImpl implements AlertService {
    private static final DateTimeFormatter ALERT_MANAGER_TIME_FORMATTER =
        DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private final AlertRepository alertRepository;
    private final AlertMapper alertMapper;
    private final AuthIdentityProvider authIdentityProvider;

    @Override
    public Mono<AlertList> listAll(final int page, final int size) {
        return Mono.fromCallable(() -> alertRepository.listAll(page, size))
            .map(alertMapper::mapAlerts);
    }

    @Override
    public Mono<AlertList> listByOwner(final int page, final int size) {
        return authIdentityProvider.fetchAssociatedOwner()
            .map(o -> alertRepository.listByOwner(page, size, o.getId()))
            .map(alertMapper::mapAlerts);
    }

    @Override
    public Mono<AlertTotals> getTotals() {
        final Mono<Long> allCount = Mono.fromCallable(alertRepository::count);

        final Mono<OwnerPojo> owner = authIdentityProvider.fetchAssociatedOwner();

        final Mono<Long> countByOwner = owner
            .map(o -> alertRepository.countByOwner(o.getId()))
            .switchIfEmpty(Mono.just(0L));

        final Mono<Long> countDependent = owner
            .map(o -> alertRepository.countDependentObjectsAlerts(o.getId()))
            .switchIfEmpty(Mono.just(0L));

        return Mono.zipDelayError(allCount, countByOwner, countDependent)
            .map(t -> new AlertTotals()
                .total(t.getT1())
                .myTotal(t.getT2())
                .dependentTotal(t.getT3()));
    }

    @Override
    public Mono<AlertStatus> updateStatus(final long alertId,
                                          final AlertStatus alertStatus) {
        return authIdentityProvider.getUsername()
            .map(username -> {
                alertRepository
                    .updateAlertStatus(alertId, AlertStatusEnum.valueOf(alertStatus.name()), username);
                return alertStatus;
            })
            .switchIfEmpty(Mono.defer(() -> {
                alertRepository
                    .updateAlertStatus(alertId, AlertStatusEnum.valueOf(alertStatus.name()), null);
                return Mono.just(alertStatus);
            }));
    }

    @Override
    public Mono<AlertList> getDataEntityAlerts(final long dataEntityId) {
        return Mono.fromCallable(() -> alertRepository.getDataEntityAlerts(dataEntityId))
            .map(alertMapper::mapAlerts);
    }

    @Override
    // TODO: handle other alert types
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
                .setType(AlertType.DISTRIBUTION_ANOMALY.getValue())
                .setDataEntityOddrn(a.getLabels().get("entity_oddrn"))
                .setDescription(String.format("Distribution Anomaly. URL: %s", queryUrl))
                .setStatus(AlertStatus.OPEN.getValue());
        }).collect(Collectors.toList());

        return Mono.fromRunnable(() -> alertRepository.createAlerts(alerts)).then();
    }

    @Override
    public Mono<AlertList> listDependentObjectsAlerts(final int page, final int size) {
        return authIdentityProvider.fetchAssociatedOwner()
            .map(o -> alertRepository.listDependentObjectsAlerts(page, size, o.getId()))
            .map(alertMapper::mapAlerts);
    }
}
