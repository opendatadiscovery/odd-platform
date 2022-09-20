package org.opendatadiscovery.oddplatform.dto;

import java.util.Set;
import org.opendatadiscovery.oddplatform.api.contract.model.OwnerAssociationRequestStatus;
import org.opendatadiscovery.oddplatform.dto.security.UserPermission;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerPojo;

public record AssociatedOwnerDto(String username,
                                 OwnerPojo owner,
                                 Set<UserPermission> permissions,
                                 OwnerAssociationRequestDto lastRequestDto) {
}
