package org.opendatadiscovery.oddplatform.service;

import org.opendatadiscovery.oddplatform.api.contract.model.DataQualityResults;
import reactor.core.publisher.Mono;

public interface DataQualityRunsService {
    Mono<DataQualityResults> getDataQualityTestsRuns();
}
