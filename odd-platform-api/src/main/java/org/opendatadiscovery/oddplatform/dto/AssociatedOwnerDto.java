package org.opendatadiscovery.oddplatform.dto;

import org.opendatadiscovery.oddplatform.api.contract.model.OwnerAssociationRequestStatus;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerPojo;

public record AssociatedOwnerDto(String username, OwnerPojo owner,
                                 OwnerAssociationRequestStatus lastRequestStatus) {
}
