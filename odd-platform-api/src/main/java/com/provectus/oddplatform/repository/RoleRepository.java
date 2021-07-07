package com.provectus.oddplatform.repository;

import com.provectus.oddplatform.model.tables.pojos.RolePojo;

import java.util.Optional;

public interface RoleRepository extends CRUDRepository<RolePojo> {
    Optional<RolePojo> getByName(final String name);

    RolePojo createOrGet(final RolePojo role);
}
