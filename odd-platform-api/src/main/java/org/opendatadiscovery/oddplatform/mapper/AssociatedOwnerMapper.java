package org.opendatadiscovery.oddplatform.mapper;

import org.opendatadiscovery.oddplatform.api.contract.model.AssociatedOwner;
import org.opendatadiscovery.oddplatform.dto.AssociatedOwnerDto;

public interface AssociatedOwnerMapper {

    AssociatedOwner mapAssociatedOwner(final AssociatedOwnerDto dto);
}
