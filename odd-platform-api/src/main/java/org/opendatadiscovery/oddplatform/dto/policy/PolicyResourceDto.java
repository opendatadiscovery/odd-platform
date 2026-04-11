package org.opendatadiscovery.oddplatform.dto.policy;

import lombok.Data;

@Data
public class PolicyResourceDto {
    private PolicyTypeDto type;
    private PolicyConditionDto conditions;
}
