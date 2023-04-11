package org.opendatadiscovery.oddplatform.service;

import org.opendatadiscovery.oddplatform.api.contract.model.DataSetStructure;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSetVersionDiffList;
import reactor.core.publisher.Mono;

public interface DatasetVersionService {
    Mono<DataSetStructure> getDatasetVersion(final long datasetId, final long datasetVersionId);

    Mono<DataSetStructure> getLatestDatasetVersion(final long datasetId);

    Mono<DataSetVersionDiffList> getDatasetVersionDiff(final long datasetId,
                                                       final long firstVersionId,
                                                       final long secondVersionId);
}
