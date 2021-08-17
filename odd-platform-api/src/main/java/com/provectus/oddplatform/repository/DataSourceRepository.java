package com.provectus.oddplatform.repository;

import com.provectus.oddplatform.model.tables.pojos.DataSourcePojo;

import java.util.Collection;
import java.util.Optional;

public interface DataSourceRepository extends CRUDRepository<DataSourcePojo> {
    Optional<DataSourcePojo> getByOddrn(final String oddrn);

    Collection<DataSourcePojo> listActive();
}
