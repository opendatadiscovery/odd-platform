package com.provectus.oddplatform.repository;

import com.provectus.oddplatform.dto.DataEntityDetailsDto;
import com.provectus.oddplatform.dto.DatasetTestReportDto;
import com.provectus.oddplatform.model.tables.pojos.DataEntityTaskRunPojo;
import java.util.Collection;
import java.util.Optional;

public interface DataQualityRepository {
    Collection<DataEntityDetailsDto> getDataQualityTests(final long datasetId);

    Collection<DataEntityTaskRunPojo> getDataQualityTestRuns(final long dataQualityTestId);

    Optional<DatasetTestReportDto> getDatasetTestReport(final long datasetId);
}
