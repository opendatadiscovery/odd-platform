package org.opendatadiscovery.oddplatform.service;

import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityList;
import org.opendatadiscovery.oddplatform.api.contract.model.DataQualityTestRunList;
import org.opendatadiscovery.oddplatform.api.contract.model.DataQualityTestRunStatus;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSetTestReport;
import reactor.core.publisher.Mono;

public interface DataQualityService {
    Mono<DataEntityList> getDatasetTests(final long dataEntityId);

    Mono<DataSetTestReport> getDatasetTestReport(final long datasetId);

    Mono<DataQualityTestRunList> getDataQualityTestRuns(final long dataQualityTestId,
                                                        final DataQualityTestRunStatus status,
                                                        final int page,
                                                        final int size);
}
