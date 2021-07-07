package com.provectus.oddplatform.repository;

import com.provectus.oddplatform.model.tables.pojos.OwnerPojo;

import java.util.Optional;

public interface UserOwnerMappingRepository {
    OwnerPojo createRelation(final String oidcUsername, final String ownerName);

    Optional<OwnerPojo> getAssociatedOwner(final String oidcUsername);
}
