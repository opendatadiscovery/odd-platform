package org.opendatadiscovery.oddplatform.repository;

import java.util.Collection;
import java.util.Optional;
import org.opendatadiscovery.oddplatform.dto.DataEntityDetailsDto;
import org.opendatadiscovery.oddplatform.dto.DatasetTestReportDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityTaskRunPojo;

public interface DataQualityRepository {
    Collection<DataEntityDetailsDto> getDataQualityTests(final long datasetId);

    Collection<DataEntityTaskRunPojo> getDataQualityTestRuns(final long dataQualityTestId);

    Optional<DatasetTestReportDto> getDatasetTestReport(final long datasetId);
}
