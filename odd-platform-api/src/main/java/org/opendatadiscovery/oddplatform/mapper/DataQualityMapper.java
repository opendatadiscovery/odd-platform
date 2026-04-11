package org.opendatadiscovery.oddplatform.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSetTestReport;
import org.opendatadiscovery.oddplatform.dto.DatasetTestReportDto;

@Mapper(config = MapperConfig.class, uses = DateTimeMapper.class)
public interface DataQualityMapper {
    @Mapping(
        target = "score",
        expression = "java( report.getTotal() != 0 ? (int)(100 * report.getSuccessTotal() / report.getTotal()) : 0 )"
    )
    DataSetTestReport mapDatasetTestReport(final DatasetTestReportDto report);
}