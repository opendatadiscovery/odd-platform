package org.opendatadiscovery.oddplatform.dto;

import java.util.List;
import org.opendatadiscovery.oddplatform.model.tables.pojos.EnumValuePojo;

public record EnumValueDto(String fieldOddrn, EnumValueDtoPayload payload) {
    public record EnumValueDtoPayload(long fieldId, List<EnumValuePojo> enumValues) {
    }
}
