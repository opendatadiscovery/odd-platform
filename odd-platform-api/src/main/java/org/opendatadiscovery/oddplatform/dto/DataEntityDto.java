package org.opendatadiscovery.oddplatform.dto;

import java.util.Map;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.opendatadiscovery.oddplatform.dto.attributes.DataEntityAttributes;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DataEntityDto {
    protected DataEntityPojo dataEntity;
    protected boolean hasAlerts;
    protected Map<DataEntityTypeDto, DataEntityAttributes> specificAttributes;
}
