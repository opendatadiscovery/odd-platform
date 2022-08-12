package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityTaskRunPojo;
import reactor.core.publisher.Mono;

public interface ReactiveDataEntityTaskRunRepository {
    Mono<Map<String, Boolean>> existsByOddrns(final List<String> oddrns);

    Mono<Void> bulkCreate(final Collection<DataEntityTaskRunPojo> pojos);

    Mono<Void> bulkUpdate(final Collection<DataEntityTaskRunPojo> pojos);

    Mono<Void> insertLastRuns(final Collection<DataEntityTaskRunPojo> pojos);
}
