package org.opendatadiscovery.oddplatform.service;

import org.opendatadiscovery.oddplatform.api.contract.model.DataQualityCategoryResultsList;
import reactor.core.publisher.Mono;

public interface DataQualityRunsService {
    Mono<DataQualityCategoryResultsList> getDataQualityTestsRuns();
}
