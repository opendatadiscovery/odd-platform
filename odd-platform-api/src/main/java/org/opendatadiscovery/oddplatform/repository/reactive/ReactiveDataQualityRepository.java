package org.opendatadiscovery.oddplatform.repository.reactive;

import org.opendatadiscovery.oddplatform.api.contract.model.DataQualityTestRunStatus;
import org.opendatadiscovery.oddplatform.dto.DatasetTestReportDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityTaskRunPojo;
import org.opendatadiscovery.oddplatform.utils.Page;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface ReactiveDataQualityRepository {
    Flux<String> getDataQualityTestOddrnsForDataset(final long datasetId);

    Mono<Page<DataEntityTaskRunPojo>> getDataQualityTestRuns(final long dataQualityTestId,
                                                             final DataQualityTestRunStatus status,
                                                             final int page,
                                                             final int size);

    Mono<DatasetTestReportDto> getDatasetTestReport(final long datasetId);
}
