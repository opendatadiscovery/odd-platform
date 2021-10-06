package com.provectus.oddplatform.dto;

import com.provectus.oddplatform.model.tables.pojos.DataEntityPojo;
import com.provectus.oddplatform.model.tables.pojos.DataEntitySubtypePojo;
import com.provectus.oddplatform.model.tables.pojos.DataEntityTypePojo;
import java.util.Collection;
import java.util.Map;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DataEntityDto {
    protected DataEntityPojo dataEntity;
    protected Collection<DataEntityTypePojo> types;
    protected DataEntitySubtypePojo subtype;
    protected boolean hasAlerts;
    protected Map<DataEntityType, DataEntityAttributes> specificAttributes;
}
