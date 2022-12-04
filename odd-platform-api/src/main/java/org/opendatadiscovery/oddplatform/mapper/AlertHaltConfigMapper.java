package org.opendatadiscovery.oddplatform.mapper;

import org.mapstruct.Mapper;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityAlertConfig;
import org.opendatadiscovery.oddplatform.model.tables.pojos.AlertHaltConfigPojo;

@Mapper(config = MapperConfig.class, uses = OffsetDateTimeMapper.class)
public interface AlertHaltConfigMapper {
    DataEntityAlertConfig mapPojo(final AlertHaltConfigPojo pojo);

    AlertHaltConfigPojo mapForm(final Long dataEntityId, final DataEntityAlertConfig form);
}
