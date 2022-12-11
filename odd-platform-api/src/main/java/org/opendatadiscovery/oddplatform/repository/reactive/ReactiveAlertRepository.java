package org.opendatadiscovery.oddplatform.repository.reactive;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import org.apache.commons.collections4.SetValuedMap;
import org.opendatadiscovery.oddplatform.dto.alert.AlertDto;
import org.opendatadiscovery.oddplatform.dto.alert.AlertStatusEnum;
import org.opendatadiscovery.oddplatform.model.tables.pojos.AlertChunkPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.AlertPojo;
import org.opendatadiscovery.oddplatform.utils.Page;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface ReactiveAlertRepository {
    Mono<AlertDto> get(final long id);

    Mono<Map<String, SetValuedMap<Short, AlertPojo>>> getOpenAlertsForEntities(
        final Collection<String> dataEntityOddrns);

    /**
     * Retrieves all alerts with status AlertStatusEnum.OPEN.
     *
     * @param page - page offset
     * @param size - amount of retrieved entries
     * @return - {@link Page} of {@link AlertDto}
     */
    Mono<Page<AlertDto>> listAllWithStatusOpen(final int page, final int size);

    /**
     * Retrieves all alerts with status AlertStatusEnum.OPEN for certain owner.
     *
     * @param page    - page offset
     * @param size    - amount of retrieved entries
     * @param ownerId - owner id
     * @return - {@link Page} of {@link AlertDto}
     */
    Mono<Page<AlertDto>> listByOwner(final int page, final int size, final long ownerId);

    /**
     * Retrieves all alerts with status AlertStatusEnum.OPEN for certain DataEntity.
     *
     * @param dataEntityId - data entity id
     * @return - List of {@link AlertDto}
     */
    Mono<List<AlertDto>> getAlertsByDataEntityId(final long dataEntityId);

    /**
     * Retrieves all alerts with status AlertStatusEnum.OPEN which are depended on the provided list of oddrns.
     *
     * @param page      - page offset
     * @param size      - amount of retrieved entries
     * @param ownOddrns - List of the parent oddrns
     * @return - {@link Page} of {@link AlertDto}
     */
    Mono<Page<AlertDto>> listDependentObjectsAlerts(final int page, final int size, final List<String> ownOddrns);

    /**
     * Retrieves all oddrns by provided owner id.
     *
     * @param ownerId - owner id
     * @return - List of oddrns
     */
    Mono<List<String>> getObjectsOddrnsByOwner(final long ownerId);

    /**
     * Counts total alert amount with status AlertStatusEnum.OPEN.
     *
     * @return - total amount of alerts
     */
    Mono<Long> countAlertsWithStatusOpen();

    /**
     * Counts total alert amount with status AlertStatusEnum.OPEN for certain owner id.
     *
     * @param ownerId - owner id
     * @return - total amount of alerts
     */
    Mono<Long> countAlertsWithStatusOpenByOwner(final long ownerId);

    /**
     * Counts total alert amount of all depended oddrns with status AlertStatusEnum.OPEN.
     *
     * @param ownOddrns - List of the parent oddrns
     * @return - total amount of alerts
     */
    Mono<Long> countDependentObjectsAlerts(final List<String> ownOddrns);

    /**
     * Updates alert status.
     *
     * @param alertId  - alert id
     * @param status   - new status
     * @param userName - username who has updated status
     * @return - {@link AlertPojo}
     */
    Mono<AlertPojo> updateAlertStatus(final long alertId, final AlertStatusEnum status, final String userName);

    Mono<Void> resolveAutomatically(final List<Long> alertIds);

    /**
     * Creates new alerts.
     *
     * @param alerts - List of new alerts
     * @return - Flux of {@link AlertPojo}
     */
    Flux<AlertPojo> createAlerts(final Collection<AlertPojo> alerts);

    Mono<Void> createChunks(final List<AlertChunkPojo> chunks);

    Mono<Void> setLastCreatedAt(final Map<Long, LocalDateTime> alertIdToLastCreatedAt);

    Mono<Long> getDataEntityIdByAlertId(final long alertId);

    Mono<Boolean> existsOpen(long alertId);
}
