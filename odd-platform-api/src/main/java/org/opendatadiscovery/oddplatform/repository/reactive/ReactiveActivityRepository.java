package org.opendatadiscovery.oddplatform.repository.reactive;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import org.opendatadiscovery.oddplatform.api.contract.model.ActivityEventType;
import org.opendatadiscovery.oddplatform.api.contract.model.ActivityType;
import org.opendatadiscovery.oddplatform.model.tables.pojos.ActivityPojo;
import reactor.core.publisher.Mono;

public interface ReactiveActivityRepository {
    Mono<ActivityPojo> save(final ActivityPojo pojo);

    Mono<List<ActivityPojo>> findActivities(final LocalDate beginDate, final LocalDate endDate, final Integer size,
                                            final Long datasourceId,
                                            final Long namespaceId,
                                            final List<Long> tagIds,
                                            final List<Long> ownerIds,
                                            final List<Long> userIds,
                                            final ActivityType type,
                                            final Long dataEntityId,
                                            final ActivityEventType eventType,
                                            final Long lastEventId,
                                            final OffsetDateTime lastEventDateTime);
}
