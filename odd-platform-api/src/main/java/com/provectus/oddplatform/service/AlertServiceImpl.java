package com.provectus.oddplatform.service;

import com.provectus.oddplatform.api.contract.model.AlertList;
import com.provectus.oddplatform.api.contract.model.AlertStatus;
import com.provectus.oddplatform.api.contract.model.AlertTotals;
import com.provectus.oddplatform.api.contract.model.AlertType;
import com.provectus.oddplatform.auth.AuthIdentityProvider;
import com.provectus.oddplatform.dto.AlertStatusEnum;
import com.provectus.oddplatform.dto.ExternalAlert;
import com.provectus.oddplatform.mapper.AlertMapper;
import com.provectus.oddplatform.model.tables.pojos.AlertPojo;
import com.provectus.oddplatform.repository.AlertRepository;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
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

        final Mono<Long> countByOwner = authIdentityProvider.fetchAssociatedOwner()
            .map(o -> alertRepository.countByOwner(o.getId()))
            .switchIfEmpty(Mono.just(0L));

        return Mono.zipDelayError(allCount, countByOwner)
            .map(t -> new AlertTotals()
                .total(t.getT1())
                .myTotal(t.getT2())
                .dependentTotal(t.getT2()));
    }

    @Override
    public Mono<com.provectus.oddplatform.api.contract.model.AlertStatus> updateStatus(final long alertId,
                                                                                       final AlertStatus alertStatus) {
        return Mono.fromCallable(() -> {
            alertRepository.updateAlertStatus(alertId, AlertStatusEnum.valueOf(alertStatus.name()));
            return alertStatus;
        });
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
}
