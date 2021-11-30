package org.opendatadiscovery.oddplatform.repository;

import java.util.Collection;
import java.util.Optional;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityTaskRunPojo;

public interface DataEntityTaskRunRepository {
    Optional<DataEntityTaskRunPojo> getLatestRun(final String dataEntityOddrn);

    void persist(final DataEntityTaskRunPojo pojo);

    void persist(final Collection<DataEntityTaskRunPojo> pojos);
}
