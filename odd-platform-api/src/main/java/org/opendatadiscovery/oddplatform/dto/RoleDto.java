package org.opendatadiscovery.oddplatform.dto;

import java.util.Collection;
import org.opendatadiscovery.oddplatform.model.tables.pojos.PolicyPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.RolePojo;

public record RoleDto(RolePojo pojo, Collection<PolicyPojo> policies) {
}
