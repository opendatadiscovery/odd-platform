package org.opendatadiscovery.oddplatform.mapper;

import java.util.Arrays;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityRun;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityRunList;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityRunStatus;
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

    // String -> DataEntityRunStatus conversion for the run status field. Tolerant by design: the DB-side
    // IngestionTaskRunStatus is the source of truth for what statuses exist, so any value the wire enum does not
    // (yet) model degrades to UNKNOWN instead of throwing IllegalArgumentException and 500-ing the runs page
    // (the generated Enum.valueOf default would). MapStruct picks this method up for the status field.
    default DataEntityRunStatus mapRunStatus(final String status) {
        if (status == null) {
            return null;
        }
        return Arrays.stream(DataEntityRunStatus.values())
            .filter(s -> s.name().equals(status))
            .findFirst()
            .orElse(DataEntityRunStatus.UNKNOWN);
    }
}
