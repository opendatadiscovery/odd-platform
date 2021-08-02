package com.provectus.oddplatform.dto;

import com.provectus.oddplatform.model.tables.pojos.AlertPojo;
import lombok.Data;
import lombok.RequiredArgsConstructor;

@Data
@RequiredArgsConstructor
public class AlertDto {
    private final AlertPojo alert;
    private final DataEntityDto dataEntityDto;
}
