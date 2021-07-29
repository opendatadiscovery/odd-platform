package com.provectus.oddplatform.service;

import com.provectus.oddplatform.api.contract.model.AlertList;
import com.provectus.oddplatform.api.contract.model.AlertStatus;
import com.provectus.oddplatform.api.contract.model.AlertTotals;
import reactor.core.publisher.Mono;

public interface AlertService {
    Mono<AlertList> listAll(final int page, final int size);

    Mono<AlertList> listByOwner(final int page, final int size);

    Mono<AlertList> listDependent(final int page, final int size);

    Mono<AlertTotals> getTotals();

    Mono<AlertStatus> updateStatus(final long alertId, final AlertStatus alertStatus);

    Mono<AlertList> getDataEntityAlerts(final long dataEntityId);
}
