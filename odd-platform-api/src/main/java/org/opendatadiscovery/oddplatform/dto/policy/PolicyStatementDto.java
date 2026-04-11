package org.opendatadiscovery.oddplatform.dto.policy;

import java.util.List;
import lombok.Data;

@Data
public class PolicyStatementDto {
    private PolicyResourceDto resource;
    private List<PolicyPermissionDto> permissions;
}
