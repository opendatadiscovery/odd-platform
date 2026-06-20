package org.opendatadiscovery.oddplatform.service;

import java.time.OffsetDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import org.apache.commons.collections4.SetValuedMap;
import org.opendatadiscovery.oddplatform.api.contract.model.Alert;
import org.opendatadiscovery.oddplatform.api.contract.model.AlertCountInfo;
import org.opendatadiscovery.oddplatform.api.contract.model.AlertList;
import org.opendatadiscovery.oddplatform.api.contract.model.AlertStatus;
import org.opendatadiscovery.oddplatform.api.contract.model.AlertTotals;
import org.opendatadiscovery.oddplatform.api.contract.model.AlertViewType;
import org.opendatadiscovery.oddplatform.dto.alert.AlertStatusEnum;
import org.opendatadiscovery.oddplatform.dto.alert.ExternalAlert;
import org.opendatadiscovery.oddplatform.model.tables.pojos.AlertPojo;
import org.opendatadiscovery.oddplatform.service.ingestion.alert.AlertAction;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface AlertService {
    // --- Legacy alert listings (deprecated; kept byte-compatible with 0.28.0, removed in a later release) ---

    Mono<AlertList> listAll(final int page, final int size);

    Mono<AlertList> listByOwner(final int page, final int size);

    Mono<AlertTotals> getTotals();

    Mono<AlertList> getDataEntityAlerts(final long dataEntityId, final int page, final int size);

    Mono<AlertList> listDependentObjectsAlerts(int page, int size);

    // --- New capable API (Activity-style tabs + period/datasource/namespace/tag/owner/status filters, #1763) ---

    Flux<Alert> getAlertList(final AlertViewType type,
                             final OffsetDateTime beginDate,
                             final OffsetDateTime endDate,
                             final Long datasourceId,
                             final Long namespaceId,
                             final List<Long> tagIds,
                             final List<Long> ownerIds,
                             final AlertStatus status,
                             final Integer page,
                             final Integer size);

    Mono<AlertCountInfo> getAlertCounts(final OffsetDateTime beginDate,
                                        final OffsetDateTime endDate,
                                        final Long datasourceId,
                                        final Long namespaceId,
                                        final List<Long> tagIds,
                                        final List<Long> ownerIds,
                                        final AlertStatus status);

    Flux<Alert> getDataEntityAlertsList(final long dataEntityId,
                                        final OffsetDateTime beginDate,
                                        final OffsetDateTime endDate,
                                        final AlertStatus status,
                                        final Integer page,
                                        final Integer size);

    // --- Shared ---

    Mono<Alert> updateStatus(final long alertId, final AlertStatus alertStatus);

    Mono<Long> getDataEntityAlertsCounts(final long dataEntityId, final AlertStatusEnum alertStatus);

    Mono<Void> handleExternalAlerts(final List<ExternalAlert> externalAlerts);

    Mono<Map<String, SetValuedMap<Short, AlertPojo>>> getOpenAlertsForEntities(
        final Collection<String> dataEntityOddrns);

    Mono<Void> applyAlertActions(final List<AlertAction> alertActions);
}
