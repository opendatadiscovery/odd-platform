package org.opendatadiscovery.oddplatform.repository;

import java.util.Collection;
import java.util.Optional;
import org.opendatadiscovery.oddplatform.api.contract.model.DataQualityTestRunStatus;
import org.opendatadiscovery.oddplatform.dto.DataEntityDetailsDto;
import org.opendatadiscovery.oddplatform.dto.DatasetTestReportDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityTaskRunPojo;
import org.opendatadiscovery.oddplatform.utils.Page;

public interface DataQualityRepository {
    Collection<DataEntityDetailsDto> getDataQualityTests(final long datasetId);

    Page<DataEntityTaskRunPojo> getDataQualityTestRuns(final long dataQualityTestId,
                                                       final DataQualityTestRunStatus status,
                                                       final Integer page,
                                                       final Integer size);

    Optional<DatasetTestReportDto> getDatasetTestReport(final long datasetId);
}
