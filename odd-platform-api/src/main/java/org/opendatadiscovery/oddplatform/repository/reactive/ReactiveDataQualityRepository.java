package org.opendatadiscovery.oddplatform.repository.reactive;

import org.opendatadiscovery.oddplatform.dto.DatasetTestReportDto;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface ReactiveDataQualityRepository {
    Flux<String> getDataQualityTestOddrnsForDataset(final long datasetId);

    Mono<DatasetTestReportDto> getDatasetTestReport(final long datasetId);
}
