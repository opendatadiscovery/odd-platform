package com.provectus.oddplatform.repository;

import com.provectus.oddplatform.dto.DataSourceDto;
import java.util.Collection;
import java.util.Optional;

public interface DataSourceRepository extends CRUDRepository<DataSourceDto> {
    Optional<DataSourceDto> getByOddrn(final String oddrn);

    Collection<DataSourceDto> listActive();

    boolean existByNamespace(final long namespaceId);
}
