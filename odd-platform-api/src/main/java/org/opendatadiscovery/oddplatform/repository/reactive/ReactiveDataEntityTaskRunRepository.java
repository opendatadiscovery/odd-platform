package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityRunStatus;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityTaskRunPojo;
import org.opendatadiscovery.oddplatform.utils.Page;
import reactor.core.publisher.Mono;

public interface ReactiveDataEntityTaskRunRepository {
    Mono<Map<String, Boolean>> existsByOddrns(final List<String> oddrns);

    Mono<Void> bulkCreate(final Collection<DataEntityTaskRunPojo> pojos);

    Mono<Void> bulkUpdate(final Collection<DataEntityTaskRunPojo> pojos);

    Mono<Void> insertLastRuns(final Collection<DataEntityTaskRunPojo> pojos);

    Mono<Page<DataEntityTaskRunPojo>> getDataEntityRuns(final long dataQualityTestId,
                                                        final DataEntityRunStatus status,
                                                        final int page,
                                                        final int size);

    Mono<Map<String, DataEntityTaskRunPojo>> getLatestRunsMap(final Collection<String> dataQualityTestOddrns);
}
