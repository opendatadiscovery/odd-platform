package org.opendatadiscovery.oddplatform.service;

import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityRunList;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityRunStatus;
import reactor.core.publisher.Mono;

public interface DataEntityRunService {
    Mono<DataEntityRunList> getDataEntityRuns(final long dataEntityId,
                                              final DataEntityRunStatus status,
                                              final int page,
                                              final int size);
}
