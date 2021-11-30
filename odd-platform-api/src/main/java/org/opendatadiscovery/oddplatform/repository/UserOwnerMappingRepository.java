package org.opendatadiscovery.oddplatform.repository;

import java.util.Optional;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerPojo;

public interface UserOwnerMappingRepository {
    OwnerPojo createRelation(final String oidcUsername, final String ownerName);

    Optional<OwnerPojo> getAssociatedOwner(final String oidcUsername);
}
