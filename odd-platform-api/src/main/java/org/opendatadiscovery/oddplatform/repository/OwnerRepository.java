package org.opendatadiscovery.oddplatform.repository;

import java.util.Optional;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerPojo;

public interface OwnerRepository extends CRUDRepository<OwnerPojo> {
    Optional<OwnerPojo> getByName(final String name);

    OwnerPojo createOrGet(final OwnerPojo owner);
}
