package org.opendatadiscovery.oddplatform.mapper;

import java.util.stream.Collectors;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.opendatadiscovery.oddplatform.api.contract.model.DataQualityTestRun;
import org.opendatadiscovery.oddplatform.api.contract.model.DataQualityTestRunList;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSetTestReport;
import org.opendatadiscovery.oddplatform.api.contract.model.PageInfo;
import org.opendatadiscovery.oddplatform.dto.DatasetTestReportDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityTaskRunPojo;
import org.opendatadiscovery.oddplatform.utils.Page;

@Mapper(config = MapperConfig.class, uses = OffsetDateTimeMapper.class)
public interface DataQualityMapper {
    @Mapping(source = "run", target = ".")
    DataQualityTestRun mapDataQualityTestRun(final Long dataQualityTestId, final DataEntityTaskRunPojo run);

    @Mapping(target = "score", expression = "java( (int)(100 * report.getSuccessTotal() / report.getTotal()) )")
    DataSetTestReport mapDatasetTestReport(final DatasetTestReportDto report);

    default DataQualityTestRunList mapDataQualityTestRuns(final Long dataQualityTestId,
                                                          final Page<DataEntityTaskRunPojo> page) {
        return new DataQualityTestRunList()
            .pageInfo(new PageInfo()
                .total(page.getTotal())
                .hasNext(page.isHasNext()))
            .items(page.getData().stream()
                .map(r -> mapDataQualityTestRun(dataQualityTestId, r))
                .collect(Collectors.toList()));
    }
}