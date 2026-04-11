package org.opendatadiscovery.oddplatform.dto.policy;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;
import lombok.Data;

@Data
public class PolicyConditionDto {
    private List<PolicyConditionDto> all;
    private List<PolicyConditionDto> any;
    private PolicyConditionUnaryDto eq;
    @JsonProperty("not_eq")
    private PolicyConditionUnaryDto notEq;
    private PolicyConditionUnaryDto match;
    @JsonProperty("not_match")
    private PolicyConditionUnaryDto notMatch;
    private PolicyConditionKeyDto is;
    @JsonProperty("not_is")
    private PolicyConditionKeyDto notIs;
}
