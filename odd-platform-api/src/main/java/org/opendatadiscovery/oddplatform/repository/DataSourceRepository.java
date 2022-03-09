package org.opendatadiscovery.oddplatform.repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.opendatadiscovery.oddplatform.dto.DataSourceDto;

public interface DataSourceRepository extends CRUDRepository<DataSourceDto> {
    Optional<DataSourceDto> getByOddrn(final String oddrn);

    List<DataSourceDto> getByOddrns(final List<String> oddrns, final boolean includeDeleted);

    Collection<DataSourceDto> listActive();

    boolean existByNamespace(final long namespaceId);

    void injectOddrn(final long id, final String oddrn);

    void restoreDataSources(final List<String> oddrns);
}
