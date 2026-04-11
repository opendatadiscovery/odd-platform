package org.opendatadiscovery.oddplatform.dto;

import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerAssociationRequestActivityPojo;

public record OwnerAssociationRequestActivityDto(OwnerAssociationRequestActivityPojo activityPojo,
                                                 OwnerAssociationRequestDto associationRequestDto) {
}
