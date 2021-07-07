package com.provectus.oddplatform.repository;

import com.provectus.oddplatform.dto.OwnershipDto;
import com.provectus.oddplatform.model.tables.pojos.OwnershipPojo;

public interface OwnershipRepository {
    OwnershipDto get(final long id);

    OwnershipPojo create(final OwnershipPojo pojo);

    void delete(final long ownershipId);

    OwnershipDto updateRole(final long ownershipId, final String roleName);
}
