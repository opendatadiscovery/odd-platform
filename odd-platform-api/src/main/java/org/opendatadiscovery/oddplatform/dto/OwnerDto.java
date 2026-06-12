package org.opendatadiscovery.oddplatform.dto;

import java.util.Collection;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.RolePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.UserOwnerMappingPojo;

public record OwnerDto(OwnerPojo ownerPojo,
                       Collection<RolePojo> roles,
                       UserOwnerMappingPojo associatedUser) {
}
