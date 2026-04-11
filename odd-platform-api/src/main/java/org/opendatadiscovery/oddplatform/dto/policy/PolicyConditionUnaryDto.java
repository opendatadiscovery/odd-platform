package org.opendatadiscovery.oddplatform.dto.policy;

import com.fasterxml.jackson.annotation.JsonAnySetter;
import java.util.HashMap;
import java.util.Map;
import lombok.Data;

@Data
public class PolicyConditionUnaryDto {
    private Map<PolicyConditionKeyDto, Object> condition = new HashMap<>();

    @JsonAnySetter
    public void setCondition(final String key, final Object value) {
        condition.put(PolicyConditionKeyDto.fromValue(key), value);
    }
}
