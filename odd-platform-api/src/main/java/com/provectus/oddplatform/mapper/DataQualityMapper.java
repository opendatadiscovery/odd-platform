package com.provectus.oddplatform.mapper;

import com.provectus.oddplatform.api.contract.model.DataQualityTestRun;
import com.provectus.oddplatform.api.contract.model.DataQualityTestRunList;
import com.provectus.oddplatform.api.contract.model.DataSetTestReport;
import com.provectus.oddplatform.dto.DatasetTestReportDto;
import com.provectus.oddplatform.model.tables.pojos.DataEntityTaskRunPojo;
import java.util.Collection;

public interface DataQualityMapper {
    DataQualityTestRun mapDataQualityTestRun(final long dataQualityTestId, final DataEntityTaskRunPojo run);

    DataQualityTestRunList mapDataQualityTestRuns(final long dataQualityTestId,
                                                  final Collection<DataEntityTaskRunPojo> runs);

    DataSetTestReport mapDatasetTestReport(final DatasetTestReportDto report);
}
