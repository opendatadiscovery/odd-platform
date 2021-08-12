package com.provectus.oddplatform.service;

import com.provectus.oddplatform.api.contract.model.DataEntityList;
import com.provectus.oddplatform.api.contract.model.DataQualityTestRunList;
import com.provectus.oddplatform.api.contract.model.DataSetTestReport;
import reactor.core.publisher.Mono;

public interface DataQualityService {
    Mono<DataEntityList> getDataEntityDataQATests(final long dataEntityId);

    Mono<DataSetTestReport> getDatasetTestReport(final long datasetId);

    Mono<DataQualityTestRunList> getDataQualityTestRuns(final long dataQualityTestId);
}
