package org.opendatadiscovery.oddplatform.repository;

import java.util.Collection;
import java.util.Optional;
import org.opendatadiscovery.oddplatform.dto.DataSourceDto;

public interface DataSourceRepository extends CRUDRepository<DataSourceDto> {
    Optional<DataSourceDto> getByOddrn(final String oddrn);

    Collection<DataSourceDto> listActive();

    boolean existByNamespace(final long namespaceId);

    void injectOddrn(final long id, final String oddrn);
}
