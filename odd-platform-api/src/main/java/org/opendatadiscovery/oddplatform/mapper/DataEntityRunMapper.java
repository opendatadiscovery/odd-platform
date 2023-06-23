package org.opendatadiscovery.oddplatform.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityRun;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityRunList;
import org.opendatadiscovery.oddplatform.api.contract.model.PageInfo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityTaskRunPojo;
import org.opendatadiscovery.oddplatform.utils.Page;

@Mapper(config = MapperConfig.class, uses = DateTimeMapper.class)
public interface DataEntityRunMapper {
    @Mapping(source = "run", target = ".")
    DataEntityRun mapDataEntityRun(final Long dataEntityId, final DataEntityTaskRunPojo run);

    default DataEntityRunList mapDataEntityRuns(final Long dataQualityTestId,
                                                final Page<DataEntityTaskRunPojo> page) {
        return new DataEntityRunList()
            .pageInfo(new PageInfo()
                .total(page.getTotal())
                .hasNext(page.isHasNext()))
            .items(page.getData().stream()
                .map(r -> mapDataEntityRun(dataQualityTestId, r))
                .toList());
    }
}
