package org.opendatadiscovery.oddplatform.dto;

import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.model.tables.pojos.AlertPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;

@Data
@RequiredArgsConstructor
public class AlertDto {
    private final AlertPojo alert;
    private final DataEntityPojo dataEntity;
}
