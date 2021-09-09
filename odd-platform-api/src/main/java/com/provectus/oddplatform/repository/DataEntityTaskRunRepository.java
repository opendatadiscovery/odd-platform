package com.provectus.oddplatform.repository;

import com.provectus.oddplatform.model.tables.pojos.DataEntityTaskRunPojo;
import java.util.Collection;
import java.util.Optional;

public interface DataEntityTaskRunRepository {
    Optional<DataEntityTaskRunPojo> getLatestRun(final String dataEntityOddrn);

    void persist(final DataEntityTaskRunPojo pojo);

    void persist(final Collection<DataEntityTaskRunPojo> pojos);
}
