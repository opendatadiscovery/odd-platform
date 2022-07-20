package org.opendatadiscovery.oddplatform.mapper;

import org.opendatadiscovery.oddplatform.api.contract.model.AssociatedOwner;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerPojo;

public interface AssociatedOwnerMapper {

    AssociatedOwner mapAssociatedOwner(final String username, final OwnerPojo owner);
}
