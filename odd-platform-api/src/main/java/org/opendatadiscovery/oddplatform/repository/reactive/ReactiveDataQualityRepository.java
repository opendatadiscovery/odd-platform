package org.opendatadiscovery.oddplatform.repository.reactive;

import org.opendatadiscovery.oddplatform.api.contract.model.DataQualityTestSeverity;
import org.opendatadiscovery.oddplatform.dto.DatasetTestReportDto;
import org.opendatadiscovery.oddplatform.dto.LastTaskRunDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataQualityTestSeverityPojo;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface ReactiveDataQualityRepository {
    Flux<String> getDataQualityTestOddrnsForDataset(final long datasetId);

    Mono<DatasetTestReportDto> getDatasetTestReport(final long datasetId);

    Mono<DataQualityTestSeverityPojo> setDataQualityTestSeverity(final long dataQualityTestId,
                                                                 final long dataEntityId,
                                                                 final DataQualityTestSeverity severity);

    Flux<LastTaskRunDto> getDatasetTrafficLight(final long datasetId);
}
