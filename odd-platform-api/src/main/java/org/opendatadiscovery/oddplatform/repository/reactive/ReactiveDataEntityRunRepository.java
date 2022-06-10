package org.opendatadiscovery.oddplatform.repository.reactive;

import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityRunStatus;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityTaskRunPojo;
import org.opendatadiscovery.oddplatform.utils.Page;
import reactor.core.publisher.Mono;

public interface ReactiveDataEntityRunRepository {
    Mono<Page<DataEntityTaskRunPojo>> getDataEntityRuns(final long dataQualityTestId,
                                                        final DataEntityRunStatus status,
                                                        final int page,
                                                        final int size);
}
