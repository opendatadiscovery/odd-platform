package com.provectus.oddplatform.controller;

import com.provectus.oddplatform.api.contract.api.AlertApi;
import com.provectus.oddplatform.api.contract.model.AlertList;
import com.provectus.oddplatform.api.contract.model.AlertStatus;
import com.provectus.oddplatform.api.contract.model.AlertTotals;
import com.provectus.oddplatform.service.AlertService;
import lombok.RequiredArgsConstructor;
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
                                                               final Mono<String> body,
                                                               final ServerWebExchange exchange) {
        return body
            .publishOn(Schedulers.boundedElastic())
            .flatMap(s -> alertService.updateStatus(alertId, AlertStatus.fromValue(s)))
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
        return alertService.listByOwner(page, size)
            .subscribeOn(Schedulers.boundedElastic())
            .map(ResponseEntity::ok);
    }
}
