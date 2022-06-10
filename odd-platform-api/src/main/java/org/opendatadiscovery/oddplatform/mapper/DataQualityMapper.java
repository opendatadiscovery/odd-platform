package org.opendatadiscovery.oddplatform.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSetTestReport;
import org.opendatadiscovery.oddplatform.dto.DatasetTestReportDto;

@Mapper(config = MapperConfig.class, uses = OffsetDateTimeMapper.class)
public interface DataQualityMapper {
    @Mapping(target = "score", expression = "java( (int)(100 * report.getSuccessTotal() / report.getTotal()) )")
    DataSetTestReport mapDatasetTestReport(final DatasetTestReportDto report);
}