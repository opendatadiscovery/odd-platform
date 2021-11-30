package org.opendatadiscovery.oddplatform.repository;

import org.opendatadiscovery.oddplatform.dto.OwnershipDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnershipPojo;

public interface OwnershipRepository {
    OwnershipDto get(final long id);

    OwnershipPojo create(final OwnershipPojo pojo);

    void delete(final long ownershipId);

    OwnershipDto updateRole(final long ownershipId, final String roleName);
}
