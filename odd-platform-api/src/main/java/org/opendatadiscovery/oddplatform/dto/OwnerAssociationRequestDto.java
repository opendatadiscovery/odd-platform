package org.opendatadiscovery.oddplatform.dto;

import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerAssociationRequestPojo;

public record OwnerAssociationRequestDto(OwnerAssociationRequestPojo pojo,
                                         String ownerName,
                                         AssociatedOwnerDto statusUpdatedUser) {
}
