package com.provectus.oddplatform.repository;

import com.provectus.oddplatform.model.tables.pojos.OwnerPojo;
import java.util.Optional;

public interface OwnerRepository extends CRUDRepository<OwnerPojo> {
    Optional<OwnerPojo> getByName(final String name);

    OwnerPojo createOrGet(final OwnerPojo owner);
}
