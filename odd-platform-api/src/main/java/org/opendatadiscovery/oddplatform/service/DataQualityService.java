package org.opendatadiscovery.oddplatform.service;

import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityList;
import org.opendatadiscovery.oddplatform.api.contract.model.DataQualityTestRunList;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSetTestReport;
import reactor.core.publisher.Mono;

public interface DataQualityService {
    Mono<DataEntityList> getDataEntityDataQATests(final long dataEntityId);

    Mono<DataSetTestReport> getDatasetTestReport(final long datasetId);

    Mono<DataQualityTestRunList> getDataQualityTestRuns(final long dataQualityTestId);
}
