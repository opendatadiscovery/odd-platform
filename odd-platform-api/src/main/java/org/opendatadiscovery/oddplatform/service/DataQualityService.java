package org.opendatadiscovery.oddplatform.service;

import org.opendatadiscovery.oddplatform.api.contract.model.DataEntity;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityList;
import org.opendatadiscovery.oddplatform.api.contract.model.DataQualityTestSeverity;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSetTestReport;
import org.opendatadiscovery.oddplatform.dto.SLA;
import reactor.core.publisher.Mono;

public interface DataQualityService {
    Mono<DataEntityList> getDatasetTests(final long dataEntityId);

    Mono<DataSetTestReport> getDatasetTestReport(final long datasetId);

    Mono<DataEntity> setDataQualityTestSeverity(final long dataQualityTest,
                                                final long datasetId,
                                                final DataQualityTestSeverity severity);

    Mono<SLA> getSLA(final long datasetId);
}
