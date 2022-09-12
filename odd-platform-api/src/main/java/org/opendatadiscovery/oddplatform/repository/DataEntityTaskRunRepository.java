package org.opendatadiscovery.oddplatform.repository;

import java.util.Optional;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityTaskRunPojo;

public interface DataEntityTaskRunRepository {
    Optional<DataEntityTaskRunPojo> getLatestRun(final String dataEntityOddrn);
}
