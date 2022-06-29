package org.opendatadiscovery.oddplatform.repository.reactive;

import java.time.LocalDate;
import java.util.List;
import org.opendatadiscovery.oddplatform.model.tables.pojos.ActivityPojo;
import reactor.core.publisher.Mono;

public interface ReactiveActivityRepository {
    Mono<ActivityPojo> save(final ActivityPojo pojo);

    List<ActivityPojo> findActivities(final Long dataEntityId, final LocalDate from, final LocalDate to);
}
