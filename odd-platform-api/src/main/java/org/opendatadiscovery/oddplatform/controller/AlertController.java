package org.opendatadiscovery.oddplatform.controller;

import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.api.AlertApi;
import org.opendatadiscovery.oddplatform.api.contract.model.AlertList;
import org.opendatadiscovery.oddplatform.api.contract.model.AlertStatus;
import org.opendatadiscovery.oddplatform.api.contract.model.AlertStatusFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.AlertTotals;
import org.opendatadiscovery.oddplatform.service.AlertService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

@RestController
@RequiredArgsConstructor
public class AlertController implements AlertApi {
    private final AlertService alertService;

    @Override
    public Mono<ResponseEntity<AlertStatus>> changeAlertStatus(final Long alertId,
                                                               final Mono<AlertStatusFormData> alertStatusFormData,
                                                               final ServerWebExchange exchange) {
        return alertStatusFormData
            .publishOn(Schedulers.boundedElastic())
            .flatMap(s -> alertService.updateStatus(alertId, s.getStatus()))
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<AlertTotals>> getAlertTotals(final ServerWebExchange exchange) {
        return alertService.getTotals()
            .subscribeOn(Schedulers.boundedElastic())
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<AlertList>> getAllAlerts(final Integer page,
                                                        final Integer size,
                                                        final ServerWebExchange exchange) {
        return alertService.listAll(page, size)
            .subscribeOn(Schedulers.boundedElastic())
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<AlertList>> getAssociatedUserAlerts(final Integer page,
                                                                   final Integer size,
                                                                   final ServerWebExchange exchange) {
        return alertService.listByOwner(page, size)
            .subscribeOn(Schedulers.boundedElastic())
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<AlertList>> getDependentEntitiesAlerts(final Integer page,
                                                                      final Integer size,
                                                                      final ServerWebExchange exchange) {
        return alertService.listDependentObjectsAlerts(page, size)
            .subscribeOn(Schedulers.boundedElastic())
            .map(ResponseEntity::ok);
    }
}
