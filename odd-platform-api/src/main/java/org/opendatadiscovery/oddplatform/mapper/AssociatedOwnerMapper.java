package org.opendatadiscovery.oddplatform.mapper;

import java.util.List;
import org.opendatadiscovery.oddplatform.api.contract.model.AssociatedOwner;
import org.opendatadiscovery.oddplatform.api.contract.model.Permission;
import org.opendatadiscovery.oddplatform.dto.AssociatedOwnerDto;

public interface AssociatedOwnerMapper {
    AssociatedOwner mapAssociatedOwner(final AssociatedOwnerDto dto);

    AssociatedOwner mapAssociatedOwnerWithPermissions(final AssociatedOwnerDto dto,
                                                      final List<Permission> permissions);
}
