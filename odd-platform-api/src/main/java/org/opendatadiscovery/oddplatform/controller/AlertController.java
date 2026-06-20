package org.opendatadiscovery.oddplatform.controller;

import java.time.OffsetDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.api.AlertApi;
import org.opendatadiscovery.oddplatform.api.contract.model.Alert;
import org.opendatadiscovery.oddplatform.api.contract.model.AlertCountInfo;
import org.opendatadiscovery.oddplatform.api.contract.model.AlertList;
import org.opendatadiscovery.oddplatform.api.contract.model.AlertStatus;
import org.opendatadiscovery.oddplatform.api.contract.model.AlertStatusFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.AlertTotals;
import org.opendatadiscovery.oddplatform.api.contract.model.AlertViewType;
import org.opendatadiscovery.oddplatform.service.AlertService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequiredArgsConstructor
public class AlertController implements AlertApi {
    private final AlertService alertService;

    @Override
    public Mono<ResponseEntity<Alert>> changeAlertStatus(final Long alertId,
                                                         final Mono<AlertStatusFormData> alertStatusFormData,
                                                         final ServerWebExchange exchange) {
        return alertStatusFormData
            .flatMap(s -> alertService.updateStatus(alertId, s.getStatus()))
            .map(ResponseEntity::ok);
    }

    // --- Legacy alert listings (deprecated; behaviour unchanged from 0.28.0) ---

    @Override
    public Mono<ResponseEntity<AlertTotals>> getAlertTotals(final ServerWebExchange exchange) {
        return alertService.getTotals()
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<AlertList>> getAllAlerts(final Integer page,
                                                        final Integer size,
                                                        final ServerWebExchange exchange) {
        return alertService.listAll(page, size)
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<AlertList>> getAssociatedUserAlerts(final Integer page,
                                                                   final Integer size,
                                                                   final ServerWebExchange exchange) {
        return alertService.listByOwner(page, size)
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<AlertList>> getDependentEntitiesAlerts(final Integer page,
                                                                      final Integer size,
                                                                      final ServerWebExchange exchange) {
        return alertService.listDependentObjectsAlerts(page, size)
            .map(ResponseEntity::ok);
    }

    // --- New capable alert listing + counts (Activity-style tabs + filters, #1763) ---

    @Override
    public Mono<ResponseEntity<Flux<Alert>>> getAlertsList(final Integer page,
                                                           final Integer size,
                                                           final AlertViewType type,
                                                           final OffsetDateTime beginDate,
                                                           final OffsetDateTime endDate,
                                                           final Long datasourceId,
                                                           final Long namespaceId,
                                                           final List<Long> tagIds,
                                                           final List<Long> ownerIds,
                                                           final AlertStatus status,
                                                           final ServerWebExchange exchange) {
        return Mono.just(alertService.getAlertList(type, beginDate, endDate, datasourceId, namespaceId, tagIds,
                ownerIds, status, page, size))
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<AlertCountInfo>> getAlertCounts(final OffsetDateTime beginDate,
                                                               final OffsetDateTime endDate,
                                                               final Long datasourceId,
                                                               final Long namespaceId,
                                                               final List<Long> tagIds,
                                                               final List<Long> ownerIds,
                                                               final AlertStatus status,
                                                               final ServerWebExchange exchange) {
        return alertService.getAlertCounts(beginDate, endDate, datasourceId, namespaceId, tagIds, ownerIds, status)
            .map(ResponseEntity::ok);
    }
}
