package org.opendatadiscovery.oddplatform.dto.policy;

import java.util.List;
import lombok.Data;

@Data
public class PolicyDto {
    private List<PolicyStatementDto> statements;
}
