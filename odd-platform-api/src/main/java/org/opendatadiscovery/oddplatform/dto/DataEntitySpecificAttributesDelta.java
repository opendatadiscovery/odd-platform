package org.opendatadiscovery.oddplatform.dto;

import java.util.Set;
import lombok.Data;

@Data
public class DataEntitySpecificAttributesDelta {
    private final String dataEntityOddrn;
    private final Set<DataEntityType> dataEntityTypes;
    private final String oldAttrsJson;
    private final String newAttrsJson;
}
