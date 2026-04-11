package org.opendatadiscovery.oddplatform.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSourceSafe;
import org.opendatadiscovery.oddplatform.dto.DataSourceDto;

@Mapper(
    config = MapperConfig.class,
    uses = {NamespaceMapper.class}
)
public interface DataSourceSafeMapper {
    @Mapping(source = "dataSource", target = ".")
    DataSourceSafe mapDto(DataSourceDto dataSourceDto);
}
