package org.opendatadiscovery.oddplatform.mapper;

import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityStatus;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityStatusEnum;
import org.opendatadiscovery.oddplatform.dto.DataEntityStatusDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.service.ingestion.util.DateTimeUtil;
import org.springframework.stereotype.Component;

@Component
public class DataEntityStatusMapper {

    public DataEntityStatus mapStatus(final DataEntityPojo pojo) {
        final DataEntityStatusDto statusDto = DataEntityStatusDto.findById(pojo.getStatus())
            .orElseThrow(() -> new IllegalArgumentException("Status shouldn't be null"));
        final DataEntityStatus status = new DataEntityStatus(DataEntityStatusEnum.fromValue(statusDto.name()));
        if (pojo.getStatusSwitchTime() != null) {
            status.setStatusSwitchTime(DateTimeUtil.mapUTCDateTime(pojo.getStatusSwitchTime()));
        }
        return status;
    }
}
