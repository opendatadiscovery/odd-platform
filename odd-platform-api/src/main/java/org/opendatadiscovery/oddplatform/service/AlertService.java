package org.opendatadiscovery.oddplatform.service;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import org.apache.commons.collections4.SetValuedMap;
import org.opendatadiscovery.oddplatform.api.contract.model.Alert;
import org.opendatadiscovery.oddplatform.api.contract.model.AlertList;
import org.opendatadiscovery.oddplatform.api.contract.model.AlertStatus;
import org.opendatadiscovery.oddplatform.api.contract.model.AlertTotals;
import org.opendatadiscovery.oddplatform.dto.alert.ExternalAlert;
import org.opendatadiscovery.oddplatform.model.tables.pojos.AlertPojo;
import org.opendatadiscovery.oddplatform.service.ingestion.alert.AlertAction;
import reactor.core.publisher.Mono;

public interface AlertService {
    Mono<AlertList> listAll(final int page, final int size);

    Mono<AlertList> listByOwner(final int page, final int size);

    Mono<AlertTotals> getTotals();

    Mono<Alert> updateStatus(final long alertId, final AlertStatus alertStatus);

    Mono<AlertList> getDataEntityAlerts(final long dataEntityId);

    Mono<Void> handleExternalAlerts(final List<ExternalAlert> externalAlerts);

    Mono<AlertList> listDependentObjectsAlerts(int page, int size);

    Mono<Map<String, SetValuedMap<Short, AlertPojo>>> getOpenAlertsForEntities(
        final Collection<String> dataEntityOddrns);

    Mono<Void> applyAlertActions(final List<AlertAction> alertActions);
}
