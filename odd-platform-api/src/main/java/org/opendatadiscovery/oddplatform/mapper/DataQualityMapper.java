package org.opendatadiscovery.oddplatform.mapper;

import java.util.Collection;
import org.opendatadiscovery.oddplatform.api.contract.model.DataQualityTestRun;
import org.opendatadiscovery.oddplatform.api.contract.model.DataQualityTestRunList;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSetTestReport;
import org.opendatadiscovery.oddplatform.dto.DatasetTestReportDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityTaskRunPojo;

public interface DataQualityMapper {
    DataQualityTestRun mapDataQualityTestRun(final long dataQualityTestId, final DataEntityTaskRunPojo run);

    DataQualityTestRunList mapDataQualityTestRuns(final long dataQualityTestId,
                                                  final Collection<DataEntityTaskRunPojo> runs);

    DataSetTestReport mapDatasetTestReport(final DatasetTestReportDto report);
}
