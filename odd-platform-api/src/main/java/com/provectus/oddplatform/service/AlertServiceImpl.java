package com.provectus.oddplatform.service;

import com.provectus.oddplatform.api.contract.model.AlertList;
import com.provectus.oddplatform.api.contract.model.AlertStatus;
import com.provectus.oddplatform.api.contract.model.AlertTotals;
import com.provectus.oddplatform.auth.AuthIdentityProvider;
import com.provectus.oddplatform.dto.AlertStatusDto;
import com.provectus.oddplatform.mapper.AlertMapper;
import com.provectus.oddplatform.repository.AlertRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class AlertServiceImpl implements AlertService {
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
    public Mono<AlertList> listDependent(final int page, final int size) {
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
    public Mono<AlertStatus> updateStatus(final long alertId, final AlertStatus alertStatus) {
        return Mono.fromCallable(() -> {
            alertRepository.updateAlertStatus(alertId, AlertStatusDto.valueOf(alertStatus.name()));
            return alertStatus;
        });
    }

    @Override
    public Mono<AlertList> getDataEntityAlerts(final long dataEntityId) {
        return Mono.fromCallable(() -> alertRepository.getDataEntityAlerts(dataEntityId))
            .map(alertMapper::mapAlerts);
    }
}
