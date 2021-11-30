package org.opendatadiscovery.oddplatform.service;

import org.opendatadiscovery.oddplatform.api.contract.model.DataSetStructure;
import reactor.core.publisher.Mono;

public interface DatasetVersionService {
    Mono<DataSetStructure> getDatasetVersion(final long datasetId, final long datasetVersionId);

    Mono<DataSetStructure> getLatestDatasetVersion(final long datasetId);
}
