package org.opendatadiscovery.oddplatform.repository;

import java.util.Optional;
import org.opendatadiscovery.oddplatform.model.tables.pojos.RolePojo;

public interface RoleRepository extends CRUDRepository<RolePojo> {
    Optional<RolePojo> getByName(final String name);

    RolePojo createOrGet(final RolePojo role);
}
