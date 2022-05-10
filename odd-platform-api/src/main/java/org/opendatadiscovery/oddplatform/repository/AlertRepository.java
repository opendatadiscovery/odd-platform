package org.opendatadiscovery.oddplatform.repository;

import java.util.Collection;
import java.util.List;
import java.util.Set;
import org.opendatadiscovery.oddplatform.dto.alert.AlertDto;
import org.opendatadiscovery.oddplatform.dto.alert.AlertStatusEnum;
import org.opendatadiscovery.oddplatform.model.tables.pojos.AlertPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveCRUDRepository;
import org.opendatadiscovery.oddplatform.utils.Page;
import reactor.core.publisher.Mono;

// TODO: 10.05.2022 matmalik javadoc
public interface AlertRepository extends ReactiveCRUDRepository<AlertPojo> {
    Mono<Page<AlertDto>> listAllWithStatusOpen(final int page, final int size);

    Mono<Page<AlertDto>> listByOwner(final int page, final int size, final long ownerId);

    Mono<List<AlertDto>> getAlertsByDataEntityId(final long dataEntityId);

    Mono<Page<AlertDto>> listDependentObjectsAlerts(final int page, final int size, final List<String> ownOddrns);

    Mono<List<String>> getObjectsOddrnsByOwner(final long ownerId);

    Mono<Long> countAlertsWithStatusOpen();

    Mono<Long> countAlertsWithStatusOpenByOwner(final long ownerId);

    Mono<Long> countDependentObjectsAlerts(final List<String> ownOddrns);

    Mono<AlertPojo> updateAlertStatus(final long alertId, final AlertStatusEnum status, final String userName);

    Mono<List<AlertPojo>> createAlerts(final Collection<AlertPojo> alerts);

    Mono<Set<String>> getExistingMessengers(final Collection<AlertPojo> alerts);
}
