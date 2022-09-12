package org.opendatadiscovery.oddplatform.service;

import java.util.List;
import org.opendatadiscovery.oddplatform.api.contract.model.AlertList;
import org.opendatadiscovery.oddplatform.api.contract.model.AlertStatus;
import org.opendatadiscovery.oddplatform.api.contract.model.AlertTotals;
import org.opendatadiscovery.oddplatform.dto.alert.ExternalAlert;
import org.opendatadiscovery.oddplatform.model.tables.pojos.AlertPojo;
import reactor.core.publisher.Mono;

public interface AlertService {
    Mono<AlertList> listAll(final int page, final int size);

    Mono<AlertList> listByOwner(final int page, final int size);

    Mono<AlertTotals> getTotals();

    Mono<AlertStatus> updateStatus(final long alertId, final AlertStatus alertStatus);

    Mono<AlertList> getDataEntityAlerts(final long dataEntityId);

    Mono<Void> handleExternalAlerts(final List<ExternalAlert> externalAlerts);

    Mono<AlertList> listDependentObjectsAlerts(int page, int size);

    Mono<List<AlertPojo>> createAlerts(final List<AlertPojo> alerts);
}
