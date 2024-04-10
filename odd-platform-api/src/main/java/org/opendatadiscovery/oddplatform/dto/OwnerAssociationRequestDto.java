package org.opendatadiscovery.oddplatform.dto;

import java.util.Collection;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerAssociationRequestPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.RolePojo;

public record OwnerAssociationRequestDto(OwnerAssociationRequestPojo pojo,
                                         String ownerName,
                                         Long ownerId,
                                         Collection<RolePojo> roles,
                                         AssociatedOwnerDto statusUpdatedUser) {
}
